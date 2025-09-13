import React from 'react';
import { profile } from '@/lib/data/profile';

export default function About() {
  return (
    <div className="space-y-4">
      <div className="hiring-badge inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm font-medium" title={`Open to offers until ${profile.hiringBadge}`}>
        {profile.hiringBadge}
      </div>
      
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{profile.name}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.role}</p>
        <p className="mt-3 text-gray-800 dark:text-gray-200">{profile.hook}</p>
      </div>
      
      <nav className="flex flex-wrap gap-3" aria-label="Social Links">
        {profile.socials.map(social => (
          <a
            key={social.id}
            href={social.href}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline text-sm"
            target={social.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
          >
            {social.label}
          </a>
        ))}
      </nav>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          BSc Applied Math & CS • EN Fluent • HE B1+ • RU Native
        </p>
      </div>
    </div>
  );
}
