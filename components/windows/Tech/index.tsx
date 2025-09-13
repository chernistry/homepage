import React from 'react';
import { coreSkills, secondarySkills } from '@/lib/data/skills';

export default function Tech() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Core Skills</h3>
        <div className="flex flex-wrap gap-2">
          {coreSkills.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Secondary Skills</h3>
        <div className="flex flex-wrap gap-2">
          {secondarySkills.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
