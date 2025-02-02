import React from 'react'
import Navigations from '../Components/Navigations/Navigations'
import Profile from '../Components/Navigations/Profile'
import SideBar from '../Components/Navigations/SideBar'
import Suggestions from '../Components/Suggestions/Suggestions'
import Contact from '../Components/Suggestions/Contact'
import LanguageList from '../Components/Suggestions/Language/LanguageList'
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList'
import ExperienceItem from '../Components/Entreprise/ExperienceItem'

export default function ScolaritePage() {
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
    },
    {
      poste: "Licence MIASHS (Codiplomation)",
      ecole: "IDMC (Institut des sciences du Digital, Management Cognition)",
      periode: "2024",
      date: 2024,
      descriptions: [
        "Formation en mathématiques appliquées",
        "Études des sciences cognitives",
        "Management des systèmes d'information"
      ]
    },
    {
      poste: "Baccalauréat Scientifique",
      ecole: "Lycée Pierre Mendes France | Epinal",
      periode: "2021",
      date: 2021,
      descriptions: [
        "Spécialité Science de l'ingénieur",
        "Formation scientifique générale",
        "Projets techniques et pratiques"
      ]
    }
  ].sort((a, b) => b.date - a.date);

  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - responsive */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Navigations />
        <Profile />
      </SideBar>

      {/* Section principale - responsive */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-[72px] md:ml-[88px] lg:ml-0">
        <div className="w-full max-w-[600px] mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Parcours Scolaire</h1>
          
          {/* Liste des formations */}
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

      {/* Section suggestions - responsive */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Contact />
        <ReseauxList />
        <LanguageList />
      </Suggestions>
    </main>
  )
}