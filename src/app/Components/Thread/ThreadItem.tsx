import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Octokit } from '@octokit/rest';
import dynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';

const ThreadHeader = dynamic(() => import('./ThreadHeader'), {
  loading: () => <div className="animate-pulse bg-secondary h-24 rounded-lg" />
});

const ThreadContent = dynamic(() => import('./ThreadContent'), {
  loading: () => <div className="animate-pulse bg-secondary h-32 rounded-lg" />
});

const ThreadStats = dynamic(() => import('./ThreadStats'), {
  loading: () => <div className="animate-pulse bg-secondary h-8 rounded-lg" />
});

const getThread = unstable_cache(
  async (id: number) => {
    return await prisma.thread.findUnique({
      where: { id },
      include: {
        comments: true,
        languages: true
      }
    });
  },
  ['thread'],
  {
    revalidate: 60,
    tags: ['thread']
  }
);

const getGithubStats = unstable_cache(
  async (githubUrl: string) => {
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });
      const [owner, repo] = githubUrl.replace('https://github.com/', '').split('/');
      
      const [repoInfo, commits, ownerInfo] = await Promise.all([
        octokit.repos.get({ owner, repo }),
        octokit.repos.getCommitActivityStats({ owner, repo }),
        octokit.users.getByUsername({ username: owner })
      ]);

      return {
        commits: Array.isArray(commits.data) 
          ? commits.data.reduce((acc, week) => acc + week.total, 0) 
          : 0,
        watchers: repoInfo.data.subscribers_count,
        stars: repoInfo.data.stargazers_count,
        ownerAvatar: ownerInfo.data.avatar_url
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats GitHub:', error);
      return {
        commits: 0,
        watchers: 0,
        stars: 0,
        ownerAvatar: ''
      };
    }
  },
  ['github-stats'],
  {
    revalidate: 3600,
    tags: ['github-stats']
  }
);

async function ThreadItem({id} : {id: number}) {
    const thread = await getThread(id);
    
    const githubStats = thread?.github 
      ? await getGithubStats(thread.github)
      : {
          commits: 0,
          watchers: 0,
          stars: 0,
          ownerAvatar: ''
        };

    if (!thread) return null;

    return (
        <div className='block w-full border-b border-border_color m-0 l-0'>
            <Link href={`/thread/${id}`} className='block'>
                <div className='pb-3 snap-proximity hover:bg-secondary transition-colors'>
                    <Suspense fallback={<div className="animate-pulse bg-secondary h-24 rounded-lg" />}>
                        <ThreadHeader 
                            title={thread.title}
                            ownerAvatar={githubStats.ownerAvatar}
                            types={thread.types}
                            languages={thread.languages}
                        />
                    </Suspense>

                    <Suspense fallback={<div className="animate-pulse bg-secondary h-32 rounded-lg" />}>
                        <ThreadContent 
                            content={thread.content}
                            imageUrl={thread.imageUrl}
                            threadId={thread.id}
                        />
                    </Suspense>

                    <Suspense fallback={<div className="animate-pulse bg-secondary h-8 rounded-lg" />}>
                        <ThreadStats 
                            commits={githubStats.commits}
                            watchers={githubStats.watchers}
                            stars={githubStats.stars}
                        />
                    </Suspense>
                </div>
            </Link>
        </div>
    );
}

export default ThreadItem