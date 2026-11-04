import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function Navbar({ title, adminLoggedIn, onLogout }) {
  return (
    <header className="top-navbar">
      <div className="page-title-badge">
        <h2>{title}</h2>
      </div>

      <div className="nav-actions">
        <div className="badge-tag">
          <Sparkles size={14} />
          <span>AI-Powered RAG</span>
        </div>

        {adminLoggedIn && (
          <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={onLogout}>
            <ShieldCheck size={14} />
            <span>Logout Admin</span>
          </button>
        )}
      </div>
    </header>
  );
}

