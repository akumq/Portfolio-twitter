import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Octokit } from '@octokit/rest';
import Link from 'next/link';
import SideBar from '@/app/Components/Navigations/SideBar';
import Navigations from '@/app/Components/Navigations/Navigations';
import Profile from '@/app/Components/Navigations/Profile';
import dynamic from 'next/dynamic';
import Suggestions from '../../Components/Suggestions/Suggestions';
import Contact from '../../Components/Suggestions/Contact';
import LanguageList from '../../Components/Suggestions/Language/LanguageList';
import ReseauxList from '../../Components/Suggestions/Reseaux/ReseauxList';
import ThreadItem from '@/app/Components/Thread/ThreadItem';
import { unstable_cache } from 'next/cache';

// Lazy load les composants lourds
const CommentList = dynamic(() => import('@/app/Components/Thread/CommentList'), {
  loading: () => <p className="text-center py-4">Chargement des commentaires...</p>
});

const CommentForm = dynamic(() => import('@/app/Components/Thread/CommentForm'), {
  loading: () => <p className="text-center py-4">Chargement du formulaire...</p>
});

const ReadmeSection = dynamic(() => import('@/app/Components/Thread/ReadmeSection'), {
  loading: () => <p className="text-center py-4">Chargement du README...</p>
});

const FileTree = dynamic(() => import('@/app/Components/Thread/FileTree'), {
  loading: () => <p className="text-center py-4">Chargement de la structure...</p>
});

const GithubStats = dynamic(() => import('@/app/Components/Thread/GithubStats'), {
  loading: () => <p className="text-center py-4">Chargement des statistiques...</p>
});

const GithubDescription = dynamic(() => import('@/app/Components/Thread/GithubDescription'), {
  loading: () => <p className="text-center py-4">Chargement de la description...</p>
});

// Cache les données GitHub pendant 1 heure
const getGithubInfo = unstable_cache(
  async (githubUrl: string, threadId: number) => {
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
        .filter(item => item.type === 'blob' && item.path)
        .map(item => item.path as string)
        .sort();

      // Récupérer les icônes des langages depuis GitHub
      const languageNames = Object.keys(languages.data);
      
      // Mettre à jour les langages dans la base de données avec leurs icônes
      await Promise.all(languageNames.map(async (name) => {
        try {
          // Vérifier si le langage existe déjà
          const existingLanguage = await prisma.language.findUnique({
            where: { name }
          });

          if (!existingLanguage) {
            // Si le langage n'existe pas, on le crée avec son icône
            const iconUrl = `https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml`;
            const response = await fetch(iconUrl);
            const data = await response.text();
            
            // Chercher l'icône dans le fichier YAML
            const languageSection = data.split('\n\n').find(section => 
              section.toLowerCase().includes(`${name.toLowerCase()}:`)
            );

            let imageUrl = null;
            if (languageSection) {
              const match = languageSection.match(/icon: (.+)/);
              if (match) {
                imageUrl = `https://raw.githubusercontent.com/github/linguist/master/lib/linguist/icons/${match[1]}`;
              }
            }

            await prisma.language.create({
              data: {
                name,
                image: imageUrl
              }
            });
          }
        } catch (error) {
          console.error(`Erreur lors de la création du langage ${name}:`, error);
        }
      }));

      // Connecter les langages au thread
      await prisma.thread.update({
        where: { id: threadId },
        data: {
          languages: {
            connect: languageNames.map(name => ({ name }))
          }
        }
      });

      return {
        description: repoInfo.data.description,
        stars: repoInfo.data.stargazers_count,
        forks: repoInfo.data.forks_count,
        readme: readmeContent,
        languages: languageNames,
        tree: treeData
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations GitHub:', error);
      return null;
    }
  },
  ['github-info'],
  { revalidate: 3600 } // Cache pendant 1 heure
);

interface ThreadPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ThreadPage(props: ThreadPageProps) {
  const { id } = await props.params;
  const threadId = parseInt(id);

  // Récupérer les informations du thread
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      languages: true,
    }
  });

  if (!thread) {
    notFound();
  }

  // Récupérer les informations GitHub si une URL est présente
  const githubInfo = thread.github ? await getGithubInfo(thread.github, threadId) : null;

  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - masquée sur mobile */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Navigations />
        <Profile />
      </SideBar>

      {/* Section principale - adaptée pour mobile */}
      <section className="flex-1 min-w-0 ml-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 h-screen overflow-hidden mt-14 sm:mt-0">
        <div className="w-full max-w-[600px] mx-auto h-full overflow-y-auto hide-scrollbar pb-20 sm:pb-0">
          {/* En-tête fixe */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border_color p-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-secondary rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold">Projet</h1>
            </div>
          </div>

          {/* ThreadItem avec Suspense */}
          <Suspense fallback={<p className="text-center py-4">Chargement du projet...</p>}>
            <div className="m-0">
              <ThreadItem id={threadId} />
            </div>
          </Suspense>
          
          {/* Informations GitHub */}
          {githubInfo && (
            <div className="p-4 space-y-6">
              {/* Stats du repo */}
              <Suspense fallback={<p className="text-center py-4">Chargement des statistiques...</p>}>
                <GithubStats stars={githubInfo.stars} forks={githubInfo.forks} />
              </Suspense>

              {/* Description */}
              {githubInfo.description && (
                <Suspense fallback={<p className="text-center py-4">Chargement de la description...</p>}>
                  <GithubDescription description={githubInfo.description} />
                </Suspense>
              )}

              {/* README avec Suspense */}
              <Suspense fallback={<p className="text-center py-4">Chargement du README...</p>}>
                <ReadmeSection content={githubInfo.readme} />
              </Suspense>

              {/* Structure avec Suspense */}
              <Suspense fallback={<p className="text-center py-4">Chargement de la structure...</p>}>
                <div className="bg-background border border-border_color rounded-xl p-4">
                  <h3 className="font-semibold mb-4">Structure du projet</h3>
                  <FileTree files={githubInfo.tree} />
                </div>
              </Suspense>
            </div>
          )}

          {/* Section commentaires avec Suspense */}
          <div className="p-4 border-t border-border_color">
            <Suspense fallback={<p className="text-center py-4">Chargement du formulaire...</p>}>
              <CommentForm threadId={threadId} />
            </Suspense>
            <Suspense fallback={<p className="text-center py-4">Chargement des commentaires...</p>}>
              <CommentList threadId={threadId} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Section suggestions - masquée sur mobile */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Suspense fallback={<p>Chargement des contacts...</p>}>
          <Contact />
        </Suspense>
        <Suspense fallback={<p>Chargement des réseaux...</p>}>
          <ReseauxList />
        </Suspense>
        <Suspense fallback={<p>Chargement des langages...</p>}>
          <LanguageList />
        </Suspense>
      </Suggestions>
    </main>
  );
}