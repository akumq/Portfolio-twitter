import React from 'react'
import Navigations from '../Components/Navigations/Navigations'
import Profile from '../Components/Navigations/Profile'
import SideBar from '../Components/Navigations/SideBar'
import Suggestions from '../Components/Suggestions/Suggestions'
import Contact from '../Components/Suggestions/Contact'
import LanguageList from '../Components/Suggestions/Language/LanguageList'
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList'

export default function EntreprisePage() {
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
          <h1 className="text-2xl font-bold mb-6">Expériences Professionnelles</h1>
          
          {/* Liste des expériences */}
          <div className="space-y-6">
            {/* Expérience 1 */}
            <div className="bg-background border border-border_color rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Développeur Full Stack</h2>
                  <p className="text-text_secondary">Entreprise XYZ</p>
                </div>
                <span className="text-sm text-text_secondary">2023 - Présent</span>
              </div>
              <ul className="list-disc list-inside text-text_secondary space-y-2">
                <li>Développement d'applications web avec Next.js et TypeScript</li>
                <li>Mise en place d'une architecture microservices</li>
                <li>Optimisation des performances et de l'expérience utilisateur</li>
              </ul>
            </div>

            {/* Expérience 2 */}
            <div className="bg-background border border-border_color rounded-xl p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Stage Développeur Backend</h2>
                  <p className="text-text_secondary">Startup ABC</p>
                </div>
                <span className="text-sm text-text_secondary">2022 - 2023</span>
              </div>
              <ul className="list-disc list-inside text-text_secondary space-y-2">
                <li>Développement d'APIs RESTful avec Node.js</li>
                <li>Gestion de bases de données PostgreSQL</li>
                <li>Intégration de systèmes de paiement</li>
              </ul>
            </div>
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