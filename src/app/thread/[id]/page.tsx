import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Octokit } from '@octokit/rest';
import Link from 'next/link';
import SideBar from '@/app/Components/Navigations/SideBar';
import Navigations from '@/app/Components/Navigations/Navigations';
import Profile from '@/app/Components/Navigations/Profile';
import ThreadContent from '@/app/Components/Thread/ThreadContent';

type TreeNode = {
  [key: string]: TreeNode | null;
};

async function getGithubInfo(githubUrl: string) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  // Extraire owner/repo de l'URL GitHub
  const [owner, repo] = githubUrl.replace('https://github.com/', '').split('/');

  try {
    const [repoInfo, readme, languages, tree] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.getReadme({ owner, repo }),
      octokit.repos.listLanguages({ owner, repo }),
      octokit.git.getTree({ owner, repo, tree_sha: 'main', recursive: 'true' })
        .catch(() => octokit.git.getTree({ owner, repo, tree_sha: 'master', recursive: 'true' }))
    ]);

    const readmeContent = Buffer.from(readme.data.content, 'base64').toString();
    const treeData = tree.data.tree
      .filter(item => item.type === 'blob' && item.path) // Ne garder que les fichiers avec un chemin défini
      .map(item => item.path as string) // On sait que path existe grâce au filtre
      .sort();

    return {
      description: repoInfo.data.description,
      stars: repoInfo.data.stargazers_count,
      forks: repoInfo.data.forks_count,
      readme: readmeContent,
      languages: Object.keys(languages.data),
      tree: treeData
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des informations GitHub:', error);
    return null;
  }
}

function FileTree({ files }: { files: string[] }) {
  // Créer une structure d'arborescence
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

  // Composant récursif pour afficher l'arborescence
  const RenderTree = ({ node, path = '', level = 0 }: { node: TreeNode, path?: string, level?: number }) => {
    return (
      <ul className={`ml-${level * 4}`}>
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
              <span className={`${children === null ? 'text-sm' : 'font-medium'}`}>{name}</span>
            </div>
            {children !== null && <RenderTree node={children} path={path + name + '/'} level={level + 1} />}
          </li>
        ))}
      </ul>
    );
  };

  return <RenderTree node={tree} />;
}

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const thread = await prisma.thread.findUnique({
    where: {
      id: parseInt(params.id)
    }
  });

  if (!thread) {
    notFound();
  }

  const githubInfo = thread.github ? await getGithubInfo(thread.github) : null;

  return (
    <div className="flex flex-row place-self-center absolute inset-1 w-8/12 h-full">
      <SideBar className="fixed">
        <div className="bg-background basis-1/12"> Logo </div>
        <Navigations />
        <Profile />
      </SideBar>

      <div className="overflow-y-auto">
        <nav className="bg-secondary p-4 mb-6 sticky top-0 z-50 shadow-md">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-text_highlight hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Retour aux projets
            </Link>
            {thread.github && (
              <a href={thread.github} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center text-text_highlight hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 mr-2">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Voir sur GitHub
              </a>
            )}
          </div>
        </nav>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
          
          <div className="bg-secondary p-6 rounded-lg mb-6">
            <ThreadContent content={thread.content} maxLength={300} />
            {thread.imageUrl && (
              <img src={thread.imageUrl} alt="Project image" className="w-full rounded-lg mb-4" />
            )}
          </div>

          {githubInfo && (
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Informations GitHub</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-text_highlight">Stars</p>
                  <p className="text-xl">{githubInfo.stars}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-text_highlight">Forks</p>
                  <p className="text-xl">{githubInfo.forks}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-text_highlight">Languages</p>
                  <p className="text-sm">{githubInfo.languages.join(', ')}</p>
                </div>
              </div>

              <div className="flex flex-row gap-6">
                <div className="prose prose-invert max-w-none flex-1">
                  <h3 className="text-lg font-bold mb-2">README</h3>
                  <div className="bg-background p-4 rounded-lg">
                    <ThreadContent content={githubInfo.readme} maxLength={500} />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Structure du Projet</h3>
                  <div className="bg-background p-4 rounded-lg max-h-[600px] overflow-y-auto">
                    <FileTree files={githubInfo.tree} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}