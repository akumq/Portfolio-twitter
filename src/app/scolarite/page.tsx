import React, { Suspense } from 'react'
import DesktopNav from '../Components/Navigations/DesktopNav'
import Suggestions from '../Components/Suggestions/Suggestions'
import Contact from '../Components/Suggestions/Contact'
import LanguageList from '../Components/Suggestions/Language/LanguageList'
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList'
import ExperienceItem from '../Components/Entreprise/ExperienceItem'

interface ScolariteProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ScolaritePage({ searchParams }: ScolariteProps) {
  await searchParams;

  const scolarite = [
    {
      poste: "Master MIAGE",
      ecole: "IDMC (Institut des sciences du Digital, Management Cognition)",
      periode: "2024 - 2025",
      date: 2025,
      descriptions: [
        "Formation en mathématiques appliquées",
        "Gestion des systèmes d'information",
        "Management des entreprises",
        "Management des projets"
      ]
    },
    {
      poste: "BUT Informatique",
      ecole: "IUT de Saint-Die-Des-Vosges",
      periode: "2021 - 2024",
      date: 2024,
      descriptions: [
        "Spécialisation en développement d'applications",
        "Projets pratiques en équipe",
        "Apprentissage des technologies web et mobiles",
        "Formation en informatique"
      ]
    }
  ].sort((a, b) => b.date - a.date);

  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - masquée sur mobile */}
      <DesktopNav />

      {/* Section principale - adaptée pour mobile */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 mt-14 sm:mt-0">
        <div className="w-full pb-20 sm:pb-0">
          <h1 className="text-2xl font-bold p-4 mb-6">Parcours Scolaire</h1>
          <div className="space-y-6">
            {scolarite.map((formation, index) => (
              <React.Fragment key={formation.poste}>
                <ExperienceItem
                  poste={formation.poste}
                  ecole={formation.ecole}
                  periode={formation.periode}
                  descriptions={formation.descriptions}
                />
                {index < scolarite.length - 1 && (
                  <hr className="border-border_color my-4" />
                )}
              </React.Fragment>
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