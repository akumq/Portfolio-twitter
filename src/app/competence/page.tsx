import React, { Suspense } from 'react'
import DesktopNav from '../Components/Navigations/DesktopNav'
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

export default function CompetencePage() {
  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - masquée sur mobile */}
      <DesktopNav />

      {/* Section principale - adaptée pour mobile */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 mt-14 sm:mt-0">
        <div className="w-full pb-20 sm:pb-0">
          <h1 className="text-2xl font-bold p-4 mb-6">Compétences</h1>
          <div className="space-y-8 p-4">
            {Object.entries(skills).map(([key, category]) => (
              <div key={key} className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="p-4 rounded-lg border border-border_color hover:bg-secondary/5 transition-colors">
                      <h3 className="font-semibold mb-2">{skill.name}</h3>
                      <p className="text-sm text-text_secondary mb-4">{skill.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-text_highlight">Formation:</span> {skill.formation}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skill.projects.map((project) => (
                            <Link 
                              key={project}
                              href={`/thread/${project}`}
                              className="text-xs px-2 py-1 rounded-full bg-text_highlight/10 text-text_highlight hover:bg-text_highlight/20 transition-colors"
                            >
                              {project}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section suggestions - masquée sur mobile */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Suspense fallback={<div>Chargement des contacts...</div>}>
          <Contact />
        </Suspense>
        <Suspense fallback={<div>Chargement des réseaux...</div>}>
          <ReseauxList />
        </Suspense>
        <Suspense fallback={<div>Chargement des langages...</div>}>
          <LanguageList />
        </Suspense>
      </Suggestions>
    </main>
  );
}