const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load .env from root and server folder
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

function getDocumentsFolder() {
  const candidates = [
    path.join(__dirname, 'documents'),
    path.join(process.cwd(), 'documents'),
    path.join(__dirname, '..', 'documents')
  ];
  return candidates.find(dir => fs.existsSync(dir)) || candidates[0];
}

let documentChunks = [];
let sourceFilesList = [];
let fullContextText = '';

// Load and chunk documents
function loadAndChunkDocuments() {
  documentChunks = [];
  sourceFilesList = [];
  fullContextText = '';

  const documentsFolder = getDocumentsFolder();
  if (!fs.existsSync(documentsFolder)) {
    console.warn('⚠️ Documents folder not found at', documentsFolder);
    return;
  }

  const files = fs.readdirSync(documentsFolder);
  for (const filename of files) {
    if (filename.endsWith('.txt')) {
      const filePath = path.join(documentsFolder, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      sourceFilesList.push({ filename, content });

      fullContextText += `\n\n--- DOCUMENT: ${filename} ---\n${content}\n`;

      // Split into paragraphs for granular source citations
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      for (const para of paragraphs) {
        documentChunks.push({
          filename,
          text: para.trim()
        });
      }
    }
  }

  console.log(`📚 Loaded ${sourceFilesList.length} documents into ${documentChunks.length} sections.`);
}

// Word-level scoring for similarity / relevance
function scoreRelevance(query, text) {
  const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const textLower = text.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    if (term.length <= 2) continue;
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    const exactMatches = (textLower.match(regex) || []).length;
    if (exactMatches > 0) {
      score += exactMatches * 3;
    } else if (textLower.includes(term)) {
      score += 1;
    }
  }

  return score;
}

// Retrieve most relevant documents / sections for citations
function retrieveRelevantSources(query) {
  if (sourceFilesList.length === 0) {
    loadAndChunkDocuments();
  }

  const scoredFiles = sourceFilesList.map(doc => ({
    filename: doc.filename,
    content: doc.content,
    score: scoreRelevance(query, doc.content)
  }));

  scoredFiles.sort((a, b) => b.score - a.score);

  // Pick files with score > 0, or top 2
  const relevant = scoredFiles.filter(f => f.score > 0);
  if (relevant.length > 0) {
    return relevant.slice(0, 3);
  }
  return scoredFiles.slice(0, 2);
}

// Answer question using Gemini RAG
async function askQuestion(question) {
  if (sourceFilesList.length === 0) {
    loadAndChunkDocuments();
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const relevantSources = retrieveRelevantSources(question);

  if (apiKey && apiKey.trim() !== '') {
    // Models in priority order (gemini-2.5-flash is confirmed working)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    const prompt = `You are the CarePlus Hospital FAQ assistant for CarePlus Multispeciality Hospital in Madanapalle, Andhra Pradesh.

Answer the user's question accurately, politely, and helpfully using the official hospital documents provided in the context below.

Rules:
1. Base your answer strictly on the hospital knowledge base provided in the context.
2. If the user asks a greeting (e.g. "hi", "hello"), greet them warmly and let them know you can help with CarePlus hospital services, doctors, OPD schedules, fees, and appointments.
3. If the answer is completely absent from the context, politely state that the information is not available in the hospital records.
4. Do not provide medical diagnosis or treatment advice.
5. Do not invent false hospital information.

Official Hospital Knowledge Base:
${fullContextText}

User Question:
${question}`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.2 }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
          answer: text,
          sources: relevantSources.map((s, idx) => ({
            id: idx + 1,
            filename: s.filename,
            content: s.content.trim()
          }))
        };
      } catch (err) {
        console.warn(`Model ${modelName} attempt failed:`, err.message);
      }
    }
  }

  // Fallback if no API key or API call failed
  if (relevantSources.length > 0 && relevantSources[0].score > 0) {
    return {
      answer: `Here is the relevant hospital information from our records:\n\n${relevantSources[0].content}\n\n(Tip: Your Google Gemini API is configured for full conversational responses).`,
      sources: relevantSources.map((s, idx) => ({
        id: idx + 1,
        filename: s.filename,
        content: s.content.trim()
      }))
    };
  }

  return {
    answer: "I am sorry, but the requested information is not available in the CarePlus Hospital documents.",
    sources: []
  };
}

// Get all source files
function getSources() {
  if (sourceFilesList.length === 0) {
    loadAndChunkDocuments();
  }
  return sourceFilesList;
}

// Initialize on start
loadAndChunkDocuments();

module.exports = {
  loadAndChunkDocuments,
  retrieveRelevantSources,
  askQuestion,
  getSources
};
