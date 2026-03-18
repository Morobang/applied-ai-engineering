'use client'

import { projects, levelColors } from '@/lib/projects'
import ProjectCard from '@/components/ProjectCard'
import ThemeSelector from '@/components/ThemeSelector'
import { useTheme } from '@/context/ThemeContext'

export default function Home() {
  const { theme } = useTheme()
  const live = projects.filter(p => p.status === 'live').length
  const building = projects.filter(p => p.status === 'building').length
  const total = projects.length

  return (
    <main>
      {/* NAV */}
      <nav>
        <span className="nav-logo">Applied AI Engineering</span>
        <div className="nav-links">
          <ThemeSelector />
          <a href="#projects">Projects</a>
          <a href="/about">About</a>
          <a
            href="https://github.com/Morobang/applied-ai-engineering"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          <span>AI · Machine Learning · Data Engineering</span>
        </div>

        <h1 className="hero-title">
          Applied AI<br />
          <span className="hero-title-dim">Engineering</span>
        </h1>

        <p className="hero-sub">
          A collection of end-to-end AI and machine learning systems built to solve
          real-world problems — from fraud detection to computer vision.
        </p>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">{total}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num" style={{ color: '#facc15' }}>{building}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num" style={{ color: '#4ade80' }}>{live}</span>
            <span className="stat-label">Live</span>
          </div>
        </div>
      </section>

      {/* LEGEND */}
      <section className="legend-bar">
        {Object.entries(levelColors).map(([level, color]) => (
          <div key={level} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span className="legend-label">{level}</span>
          </div>
        ))}
      </section>

      {/* PROJECT GRID */}
      <section className="projects-section" id="projects">
        <div className="section-header">
          <h2 className="section-title">Projects</h2>
          <span className="section-count">{total} total</span>
        </div>

        <div className="grid">
          {projects.map((project, i) => (
            <div
              key={project.slug}
              className="grid-item"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span>Built by Morobang Tshigidimisa</span>
        <div className="footer-links">
          <a href="https://github.com/Morobang" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/morobang-tshigidimisa" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://morobangtshigidimisa.vercel.app" target="_blank" rel="noopener noreferrer">Portfolio</a>
        </div>
      </footer>

      <style jsx>{`
        * { box-sizing: border-box; }

        main {
          min-height: 100vh;
          background: var(--primary);
          color: var(--text);
          font-family: var(--font-primary);
          transition: background-color var(--transition-base), color var(--transition-base);
        }

        /* NAV */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 48px;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: color-mix(in srgb, var(--primary) 93%, transparent);
          backdrop-filter: var(--blur-amount);
          z-index: 100;
          transition: background-color var(--transition-base), border-color var(--transition-base);
        }
        .nav-logo {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-dim);
          letter-spacing: 0.02em;
        }
        .nav-links {
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .nav-links a {
          font-size: 13px;
          color: var(--text-dim);
          text-decoration: none;
          transition: color var(--transition-fast);
          font-family: var(--font-primary);
        }
        .nav-links a:hover {
          color: var(--text);
        }

        /* HERO */
        .hero {
          padding: 96px 48px 80px;
          max-width: 900px;
        }
        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .eyebrow-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hero-title {
          font-size: clamp(48px, 8vw, 88px);
          font-weight: 400;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: var(--text);
          margin: 0 0 28px;
          transition: color var(--transition-base);
        }
        .hero-title-dim {
          color: var(--text-dimmer);
        }
        .hero-sub {
          font-size: 16px;
          color: var(--text-dim);
          line-height: 1.7;
          max-width: 520px;
          margin: 0 0 48px;
          font-family: var(--font-primary);
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-num {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 400;
          color: var(--text);
          line-height: 1;
          transition: color var(--transition-base);
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-dimmer);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: var(--font-mono);
        }
        .stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border);
        }

        /* LEGEND */
        .legend-bar {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          padding: 0 48px 48px;
          border-bottom: 1px solid var(--border);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .legend-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-dimmer);
          letter-spacing: 0.05em;
        }

        /* PROJECTS */
        .projects-section {
          padding: 64px 48px 96px;
        }
        .section-header {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 32px;
        }
        .section-title {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 400;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0;
        }
        .section-count {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-dimmer);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          transition: background-color var(--transition-base), border-color var(--transition-base);
        }
        .grid-item {
          animation: fadeUp 0.4s ease both;
          background: var(--card-bg);
          transition: background-color var(--transition-base);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* FOOTER */
        footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 48px;
          border-top: 1px solid var(--border);
          font-size: 12px;
          color: var(--text-dimmer);
          transition: border-color var(--transition-base), color var(--transition-base);
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-links a {
          color: var(--text-dimmer);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .footer-links a:hover {
          color: var(--text);
        }

        @media (max-width: 640px) {
          nav { padding: 16px 20px; }
          .nav-links { gap: 16px; }
          .hero { padding: 64px 20px 48px; }
          .legend-bar { padding: 0 20px 32px; }
          .projects-section { padding: 48px 20px 64px; }
          footer { padding: 20px; flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>
    </main>
  )
}