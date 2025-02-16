import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL GitHub manquante' },
        { status: 400 }
      );
    }

    const [owner, repo] = url.replace('https://github.com/', '').split('/');

    try {
      const [repoInfo, commits, ownerInfo] = await Promise.all([
        octokit.repos.get({ owner, repo }).catch(() => null),
        octokit.repos.getCommitActivityStats({ owner, repo }).catch(() => null),
        octokit.users.getByUsername({ username: owner }).catch(() => null)
      ]);

      if (!repoInfo?.data) {
        return NextResponse.json(
          { error: 'Dépôt non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        commits: Array.isArray(commits?.data) 
          ? commits.data.reduce((acc, week) => acc + week.total, 0) 
          : 0,
        watchers: repoInfo.data.subscribers_count,
        stars: repoInfo.data.stargazers_count,
        ownerAvatar: ownerInfo?.data?.avatar_url
      });
    } catch (error) {
      console.error('Erreur lors des appels API GitHub:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la communication avec l\'API GitHub' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 