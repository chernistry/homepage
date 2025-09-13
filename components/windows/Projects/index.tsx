import React, { useState } from 'react';
import Image from 'next/image';
import { projects, moreProjects } from '@/lib/data/projects';
import { clients } from '@/lib/data/clients';

export default function Projects() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Projects</h2>
        <div className="space-y-3">
          {projects.map(project => (
            <div key={project.title} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              {project.icon && <span className="text-lg">{project.icon}</span>}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {project.href ? (
                    <a href={project.href} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                      {project.title} ↗
                    </a>
                  ) : (
                    project.title
                  )}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                )}
                {project.techTags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.techTags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
        >
          {showMore ? '↓ Hide more projects' : '→ Show more projects'}
        </button>
        
        {showMore && (
          <div className="mt-4 space-y-3">
            {moreProjects.map(project => (
              <div key={project.title} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                {project.icon && <span className="text-lg">{project.icon}</span>}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {project.href ? (
                      <a href={project.href} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                        {project.title} ↗
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                  )}
                  {project.techTags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.techTags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section>
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">Clients</h3>
        <div className="grid grid-cols-2 gap-4">
          {clients.map(client => (
            <a
              key={client.name}
              href={client.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Image
                src={client.logo}
                alt={client.alt}
                width={80}
                height={40}
                className="object-contain"
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
