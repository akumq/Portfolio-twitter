import React, { Suspense } from 'react'
import DesktopNav from '../Components/Navigations/DesktopNav'
import Suggestions from '../Components/Suggestions/Suggestions'
import Contact from '../Components/Suggestions/Contact'
import LanguageList from '../Components/Suggestions/Language/LanguageList'
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

// Fonction pour récupérer les données des compétences
async function getSkillsData() {
  const prisma = new PrismaClient()
  try {
    const categories = await prisma.skillCategory.findMany({
      include: {
        skills: {
          include: {
            languages: true,
            threads: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })
    return categories
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function CompetencePage() {
  // Récupération des données des compétences
  const skillCategories = await getSkillsData()

  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - masquée sur mobile */}
      <DesktopNav />

      {/* Section principale - adaptée pour mobile */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 mt-14 sm:mt-0">
        <div className="w-full pb-20 sm:pb-0 h-screen overflow-y-auto">
          <h1 className="text-2xl font-bold p-4 mb-6">Compétences</h1>
          <div className="space-y-8 p-4">
            {skillCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.skills.map((skill) => (
                    <div key={skill.id} className="p-4 rounded-lg border border-border_color hover:bg-secondary/5 transition-colors">
                      <h3 className="font-semibold mb-2">{skill.name}</h3>
                      <p className="text-sm text-text_secondary mb-4">{skill.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-text_highlight">Formation:</span> {skill.formation}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skill.threads.map((thread) => (
                            <Link 
                              key={thread.id}
                              href={`/thread/${thread.id}`}
                              className="text-xs px-2 py-1 rounded-full bg-text_highlight/10 text-text_highlight hover:bg-text_highlight/20 transition-colors"
                            >
                              {thread.title}
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