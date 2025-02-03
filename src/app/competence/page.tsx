import React, { Suspense } from 'react'
import Navigations from '../Components/Navigations/Navigations'
import Profile from '../Components/Navigations/Profile'
import SideBar from '../Components/Navigations/SideBar'
import Suggestions from '../Components/Suggestions/Suggestions'
import Contact from '../Components/Suggestions/Contact'
import LanguageList from '../Components/Suggestions/Language/LanguageList'
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList'
import Link from 'next/link'

const skills = {
  frontend: {
    title: 'Frontend',
    icon: '🎨',
    skills: [
      { 
        name: 'React', 
        description: 'Développement d\'applications web modernes avec React et ses écosystèmes',
        projects: ['portfolio', 'twitter-clone'],
        formation: 'Autodidacte'
      },
      { 
        name: 'Next.js', 
        description: 'Création de sites web performants avec le framework Next.js',
        projects: ['portfolio'],
        formation: 'Autodidacte'
      },
      { 
        name: 'TypeScript', 
        description: 'Développement typé pour une meilleure maintenabilité',
        projects: ['portfolio', 'twitter-clone'],
        formation: 'BUT Informatique'
      },
      { 
        name: 'TailwindCSS', 
        description: 'Stylisation rapide et responsive avec TailwindCSS',
        projects: ['portfolio'],
        formation: 'BUT Informatique'
      }
    ]
  },
  backend: {
    title: 'Backend',
    icon: '⚙️',
    skills: [
      { 
        name: 'Node.js', 
        description: 'Développement backend avec Node.js et Express',
        projects: ['twitter-clone'],
        formation: 'Autodidacte'
      },
      { 
        name: 'Python', 
        description: 'Développement d\'applications et scripts Python',
        projects: ['data-analysis'],
        formation: 'Autodidacte'
      },
      { 
        name: 'PostgreSQL', 
        description: 'Gestion de bases de données relationnelles',
        projects: ['twitter-clone'],
        formation: 'Master MIAGE'
      },
      { 
        name: 'Prisma', 
        description: 'ORM moderne pour TypeScript et Node.js',
        projects: ['portfolio'],
        formation: 'Autodidacte'
      }
    ]
  },
  tools: {
    title: 'Outils & Méthodes',
    icon: '🛠️',
    skills: [
      { 
        name: 'Git', 
        description: 'Gestion de version et collaboration',
        projects: ['tous les projets'],
        formation: 'Autodidacte'
      },
      { 
        name: 'Docker', 
        description: 'Conteneurisation d\'applications',
        projects: ['twitter-clone'],
        formation: 'BUT Informatique'
      },
      { 
        name: 'CI/CD', 
        description: 'Intégration et déploiement continus',
        projects: ['portfolio'],
        formation: 'BUT Informatique'
      },
      { 
        name: 'Agile/Scrum', 
        description: 'Méthodologies de gestion de projet agile',
        projects: ['tous les projets'],
        formation: 'BUT Informatique / Master MIAGE'
      }
    ]
  }
};

function SkillCard({ 
  name, 
  description, 
  projects, 
  formation 
}: { 
  name: string; 
  description: string;
  projects: string[];
  formation: string;
}) {
  return (
    <Link href="/scolarite" className="block">
      <div className="border border-border_color rounded-xl p-4 hover:bg-secondary/5 transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-text_highlight/10 flex items-center justify-center">
            <span className="text-xl">{name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{name}</h3>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {formation}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {projects.map((project) => (
                <span 
                  key={project}
                  className="text-sm text-text_highlight"
                >
                  #{project}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkillCategory({ title, icon, skills }: { 
  title: string; 
  icon: string; 
  skills: Array<{ 
    name: string; 
    description: string;
    projects: string[];
    formation: string;
  }> 
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-4">
        {skills.map(skill => (
          <SkillCard key={skill.name} {...skill} />
        ))}
      </div>
    </div>
  );
}

interface CompetenceProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CompetencePage({ searchParams }: CompetenceProps) {
  await searchParams;

  return (
    <main className="flex min-h-screen h-screen flex-row max-w-7xl mx-auto overflow-hidden">
      {/* Barre latérale - masquée sur mobile */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Navigations />
        <Profile />
      </SideBar>

      {/* Section principale - adaptée pour mobile */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 h-screen flex flex-col mt-14 sm:mt-0">
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 sm:pb-0">
          <div className="p-4 max-w-[600px] mx-auto">
            {Object.entries(skills).map(([key, category]) => (
              <SkillCategory key={key} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Section suggestions - masquée sur mobile */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Suspense fallback={<p className="text-sm p-2">Chargement des contacts...</p>}>
          <Contact />
        </Suspense>
        <Suspense fallback={<p className="text-sm p-2">Chargement des réseaux...</p>}>
          <ReseauxList />
        </Suspense>
        <Suspense fallback={<p className="text-sm p-2">Chargement des langages...</p>}>
          <LanguageList />
        </Suspense>
      </Suggestions>
    </main>
  )
}