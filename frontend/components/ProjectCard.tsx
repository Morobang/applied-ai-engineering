'use client'

import { type Project, levelColors } from '@/lib/projects'

export default function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    live: '#4ade80',
    building: '#facc15',
    planned: '#94a3b8'
  }

  return (
    <div className="project-card">
      <div className="card-header">
        <span className="project-number">{project.number}</span>
        <span 
          className="level-badge"
          style={{ background: levelColors[project.level], color: '#000' }}
        >
          {project.level}
        </span>
      </div>
      
      <h3 className="project-title">{project.title}</h3>
      <p className="project-description">{project.description}</p>
      
      <div className="project-tags">
        {project.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
        {project.tags.length > 3 && (
          <span className="tag">+{project.tags.length - 3}</span>
        )}
      </div>

      <div className="card-footer">
        <span className="demo-badge">
          {project.demoType === 'webcam' && '📷'}
          {project.demoType === 'upload' && '📤'}
          {project.demoType === 'simulate' && '🎮'}
          {project.demoType === 'text' && '📝'}
          {' '}{project.demoType}
        </span>
        <a href={`/projects/${project.slug}`} className="project-link">
          View →
        </a>
      </div>

      <style jsx>{`
        .project-card {
          padding: 24px;
          background: var(--card-bg);
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-base);
          border: 1px solid transparent;
          position: relative;
        }
        
        .project-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .project-number {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-dimmer);
          font-weight: 500;
        }
        
        .level-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 20px;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        
        .project-title {
          font-family: var(--font-primary);
          font-size: 18px;
          font-weight: 500;
          margin: 0 0 12px;
          color: var(--text);
          line-height: 1.3;
        }
        
        .project-description {
          font-size: 14px;
          color: var(--text-dim);
          line-height: 1.6;
          margin: 0 0 16px;
          flex: 1;
        }
        
        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .tag {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-dimmer);
          background: var(--secondary);
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.02em;
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }
        
        .demo-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-dim);
          text-transform: capitalize;
        }
        
        .project-link {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-dim);
          text-decoration: none;
          transition: color var(--transition-fast);
          display: inline-flex;
          align-items: center;
        }
        
        .project-link:hover {
          color: var(--accent);
        }

        /* Status indicator dot */
        .project-card::before {
          content: '';
          position: absolute;
          top: 24px;
          right: 24px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${statusColors[project.status]};
          opacity: 0.5;
        }
      `}</style>
    </div>
  )
}