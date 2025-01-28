import React from 'react'
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Octokit } from '@octokit/rest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import GithubLink from './GithubLink';

async function ThreadItem({id} : {id: number}) {
    const thread = await prisma.thread.findUnique({
        where: {
            id: id
        },
        include: {
            comments: true
        }
    });

    let githubStats = {
        stars: 0,
        commits: 0,
        hasStarred: false,
        watchers: 0,
        ownerAvatar: ''
    };

    const session = await getServerSession(authOptions);

    if (thread?.github) {
        try {
            const octokit = new Octokit({
                auth: process.env.GITHUB_TOKEN
            });
            const [owner, repo] = thread.github.replace('https://github.com/', '').split('/');
            
            const [repoInfo, commits, ownerInfo] = await Promise.all([
                octokit.repos.get({ owner, repo }),
                octokit.repos.getCommitActivityStats({ owner, repo }),
                octokit.users.getByUsername({ username: owner })
            ]);

            githubStats.stars = repoInfo.data.stargazers_count;
            githubStats.commits = commits.data?.reduce((acc, week) => acc + week.total, 0) || 0;
            githubStats.watchers = repoInfo.data.subscribers_count;
            githubStats.ownerAvatar = ownerInfo.data.avatar_url;

            // Vérifier si l'utilisateur connecté a mis une étoile
            if (session?.user?.email) {
                try {
                    const { data: starStatus } = await octokit.activity.checkRepoIsStarredByAuthenticatedUser({
                        owner,
                        repo
                    });
                    githubStats.hasStarred = true;
                } catch (error) {
                    githubStats.hasStarred = false;
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des stats GitHub:', error);
        }
    }

    return (
        <Link href={`/thread/${id}`} className='block'>
            <div className='border border-border_color pb-3 snap-proximity hover:bg-secondary transition-colors'>
                <div className="flex flex-row">
                    <div className="bg-slate-600 rounded-full size-11 m-3 flex items-center justify-center overflow-hidden">
                        {githubStats.ownerAvatar ? (
                            <img src={githubStats.ownerAvatar} alt="Owner avatar" className="w-full h-full object-cover" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="size-7 text-white">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-xl">{thread?.github ? thread.github.split('/').pop() : 'Projet'}</h3>
                        {thread?.github && (
                            <GithubLink 
                                href={thread.github} 
                                username={thread.github.split('/').slice(-2)[0]} 
                            />
                        )}
                    </div>
                </div>
                <div className='m-3'>
                    {thread?.content}
                </div>
                {thread?.imageUrl && (
                    <div className="w-full">
                        <img className="m-auto w-auto self-center object-cover rounded-lg" src={thread.imageUrl} alt="image description" />
                    </div>
                )}
                <div className="flex flex-row h-auto w-full mx-6 my-2 flex-auto">
                    <div className="flex w-auto flex-row flex-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 self-center stroke-border_color">
                            <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                        </svg>
                        <p className="opacity-50 text-xs self-center">{thread?.comments.length || 0}</p>
                    </div>

                    <div className="flex w-auto flex-row flex-auto items-center">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill={githubStats.hasStarred ? "rgb(234 179 8)" : "none"}
                            stroke="currentColor" 
                            className={`size-5 self-center ${
                                githubStats.hasStarred 
                                    ? "stroke-yellow-500" 
                                    : "stroke-border_color hover:fill-yellow-500 hover:stroke-yellow-500"
                            } transition-colors`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                        <p className="opacity-50 text-xs self-center">{githubStats.stars}</p>
                    </div>

                    <div className="flex flex-row flex-auto grow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 self-center stroke-border_color">
                            <path d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                        </svg>
                        <p className="opacity-50 text-xs self-center">{githubStats.commits}</p>
                    </div>
                    
                    <div className="flex w-auto flex-row flex-auto">   
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 self-center stroke-border_color">
                            <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                        <p className="opacity-50 text-xs self-center">{ githubStats.watchers}</p>
                    </div>     
                </div>
            </div>
        </Link>
    );
}

export default ThreadItem