'use client'

import Link from 'next/link'
import { Project, levelColors } from '@/lib/projects'

const statusConfig = {
  live: { label: 'Live', color: '#4ade80' },
  building: { label: 'Building', color: '#facc15' },
  planned: { label: 'Planned', color: '#6b7280' },
}

const demoIcons: Record<Project['demoType'], string> = {
  upload: '↑',
  webcam: '◉',
  simulate: '▶',
  text: '✦',
}

export default function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig[project.status]
  const levelColor = levelColors[project.level]

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="project-card">
        <div className="card-header">
          <span className="project-number">{project.number}</span>
          <div className="card-meta">
            <span className="demo-type" title={`Demo: ${project.demoType}`}>
              {demoIcons[project.demoType]}
            </span>
            <span
              className="status-dot"
              style={{ background: status.color }}
              title={status.label}
            />
          </div>
        </div>

        <div className="card-body">
          <h3 className="project-title">{project.title}</h3>
          <p className="project-desc">{project.description}</p>
        </div>

        <div className="card-footer">
          <span className="level-tag" style={{ color: levelColor, borderColor: levelColor + '33' }}>
            {project.level}
          </span>
          <div className="tags">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="card-arrow">→</div>
      </div>

      <style jsx>{`
        .project-card {
          position: relative;
          background: #0d0d0d;
          border: 1px solid #1f1f1f;
          border-radius: 2px;
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s ease, background 0.2s ease;
          cursor: pointer;
          overflow: hidden;
        }
        .project-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ffffff22, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .group:hover .project-card {
          border-color: #333;
          background: #111;
        }
        .group:hover .project-card::before {
          opacity: 1;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .project-number {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 11px;
          color: #444;
          letter-spacing: 0.1em;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .demo-type {
          font-size: 12px;
          color: #555;
          transition: color 0.2s;
        }
        .group:hover .demo-type {
          color: #888;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          opacity: 0.8;
        }
        .card-body {
          flex: 1;
        }
        .project-title {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 14px;
          font-weight: 500;
          color: #e5e5e5;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
          line-height: 1.4;
          transition: color 0.2s;
        }
        .group:hover .project-title {
          color: #fff;
        }
        .project-desc {
          font-size: 13px;
          color: #555;
          margin: 0;
          line-height: 1.6;
          transition: color 0.2s;
        }
        .group:hover .project-desc {
          color: #666;
        }
        .card-footer {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .level-tag {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
          padding: 2px 8px;
          border-radius: 2px;
          display: inline-block;
          width: fit-content;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          font-size: 11px;
          color: #444;
          background: #161616;
          border: 1px solid #222;
          padding: 2px 8px;
          border-radius: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .group:hover .tag {
          color: #555;
          border-color: #2a2a2a;
        }
        .card-arrow {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 14px;
          color: #2a2a2a;
          transition: color 0.2s, transform 0.2s;
        }
        .group:hover .card-arrow {
          color: #555;
          transform: translateX(3px);
        }
      `}</style>
    </Link>
  )
}