'use client'

import { useTheme } from '@/context/ThemeContext'

const themes = [
  { id: 'neo-minimal', name: 'Neo-Minimal', icon: '◈' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '⚡' },
  { id: 'warm-industrial', name: 'Warm Industrial', icon: '◉' },
  { id: 'glassmorphic', name: 'Glassmorphic', icon: '◐' },
  { id: 'tech-noir', name: 'Tech Noir', icon: '◆' },
] as const

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="theme-selector">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`theme-btn ${theme === t.id ? 'active' : ''}`}
          title={t.name}
        >
          <span className="theme-icon">{t.icon}</span>
          <span className="theme-name">{t.name}</span>
        </button>
      ))}
      
      <style jsx>{`
        .theme-selector {
          display: flex;
          gap: 4px;
          margin-right: 16px;
        }
        
        .theme-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-size: 12px;
          font-family: var(--font-mono);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .theme-btn:hover {
          border-color: var(--accent);
          color: var(--text);
        }
        
        .theme-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #000;
        }
        
        .theme-icon {
          font-size: 14px;
        }
        
        .theme-name {
          display: none;
        }
        
        @media (min-width: 768px) {
          .theme-name {
            display: inline;
          }
        }
      `}</style>
    </div>
  )
}