import React, { useState } from 'react';
import { Bot, Send, User, ChevronDown, ChevronUp, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const SUGGESTED_QUESTIONS = [
  "What are the Cardiology OPD timings?",
  "What are the consultation fees at CarePlus?",
  "Who is the doctor for Neurology and what are their timings?",
  "What documents should I carry for an appointment?",
  "Is the emergency department open 24 hours?",
  "What services are offered in Dermatology?"
];

export default function FaqChat() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am the CarePlus Hospital AI Assistant. You can ask me any question regarding our doctors, departments, OPD schedules, fees, and appointment rules.",
      sources: []
    }
  ]);
  const [expandedSources, setExpandedSources] = useState({});

  const toggleSource = (msgIndex, sourceId) => {
    const key = `${msgIndex}-${sourceId}`;
    setExpandedSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || loading) return;

    const userQ = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);

    try {
      const response = await api.askFaq(userQ);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: response.answer || "I'm sorry, I couldn't find an answer.",
          sources: response.sources || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "❌ Sorry, an error occurred while retrieving your answer. Please ensure the server is running.",
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggested = (q) => {
    setQuestion(q);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 className="card-title">
          <Bot size={22} color="#0284c7" />
          <span>CarePlus Hospital AI Assistant (RAG)</span>
        </h3>
        <p className="card-subtitle">
          Answers hospital questions using Google Gemini and verified documents from our knowledge base.
        </p>

        {/* Suggested Queries */}
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Suggested Queries:
          </span>
          <div className="suggested-chips">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button key={idx} className="chip-btn" onClick={() => handleSelectSuggested(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="chat-container">
        <div className="chat-history">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <div className="avatar-badge">
                  {isUser ? <User size={18} color="#0284c7" /> : <Bot size={18} color="#0d9488" />}
                </div>
                <div>
                  <div className="chat-bubble">
                    {msg.text}
                  </div>

                  {/* Sources Accordion */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        <BookOpen size={14} />
                        <span>Sources Used by RAG ({msg.sources.length})</span>
                      </div>
                      {msg.sources.map((s) => {
                        const isOpen = !!expandedSources[`${index}-${s.id}`];
                        return (
                          <div key={s.id} className="source-accordion" style={{ maxWidth: '600px', marginBottom: '6px' }}>
                            <div className="source-header" onClick={() => toggleSource(index, s.id)} style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
                              <span>📄 Source {s.id}: <strong>{s.filename}</strong></span>
                              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                            {isOpen && (
                              <div className="source-content" style={{ padding: '10px 12px', fontSize: '0.82rem' }}>
                                {s.content}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-message assistant">
              <div className="avatar-badge">
                <Bot size={18} color="#0d9488" />
              </div>
              <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                <Sparkles size={16} className="spin-icon" />
                <span>Searching hospital documents and generating response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form className="chat-input-wrapper" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question... (e.g. What are the Cardiology OPD timings?)"
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !question.trim()}>
            <Send size={18} />
            <span>Ask</span>
          </button>
        </form>
      </div>

      <div style={{ marginTop: '16px' }} className="alert alert-warning">
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>Answers are generated strictly from CarePlus Hospital documents. Not intended for clinical diagnosis.</span>
      </div>
    </div>
  );
}

