import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { api } from '../services/api';

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSources()
      .then(res => {
        setSources(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (filename) => {
    setExpanded(prev => ({ ...prev, [filename]: !prev[filename] }));
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">
          <BookOpen size={22} color="#0284c7" />
          <span>Hospital Knowledge Base Documents</span>
        </h3>
        <p className="card-subtitle">
          These verified clinical and administrative documents constitute the ground-truth knowledge base retrieved by the RAG Chatbot.
        </p>

        <div className="alert alert-info">
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>
            When a user asks a question, semantic search indexes these documents to extract relevant chunks, ensuring factual answers without hallucination.
          </span>
        </div>

        {loading ? (
          <p>Loading source files...</p>
        ) : (
          <div>
            {sources.map((src) => {
              const isOpen = !!expanded[src.filename];
              return (
                <div key={src.filename} className="source-accordion">
                  <div className="source-header" onClick={() => toggleExpand(src.filename)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="#0284c7" />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{src.filename}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {src.content ? `${src.content.length} characters` : ''}
                      </span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="source-content" style={{ background: '#f8fafc', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {src.content}
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
}

