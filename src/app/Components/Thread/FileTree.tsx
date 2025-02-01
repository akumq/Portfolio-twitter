'use client';

import React from 'react';

type TreeNode = {
  [key: string]: TreeNode | null;
};

const LEVEL_MARGINS = {
  0: 'ml-0',
  1: 'ml-4',
  2: 'ml-8',
  3: 'ml-12',
  4: 'ml-16',
  5: 'ml-20',
} as const;

export default function FileTree({ files }: { files: string[] }) {
  const tree: TreeNode = {};
  
  files.forEach(path => {
    const parts = path.split('/');
    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part] as TreeNode;
      }
    });
  });

  const RenderTree = ({ node, path = '', level = 0 }: { node: TreeNode, path?: string, level?: number }) => {
    const marginClass = LEVEL_MARGINS[Math.min(level, 5) as keyof typeof LEVEL_MARGINS];

    return (
      <ul className={marginClass}>
        {Object.entries(node).map(([name, children]) => (
          <li key={path + name} className="my-1">
            <div className="flex items-center">
              {children === null ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-text_highlight">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-text_highlight">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
              )}
              <span className={children === null ? 'text-sm' : 'font-medium'}>{name}</span>
            </div>
            {children !== null && <RenderTree node={children} path={path + name + '/'} level={level + 1} />}
          </li>
        ))}
      </ul>
    );
  };

  return <RenderTree node={tree} />;
} 