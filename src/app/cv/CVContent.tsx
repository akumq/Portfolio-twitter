'use client';

import React from 'react';

interface CVData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  city: string;
  country: string;
  email: string;
  education: Array<{
    school: string;
    degree: string;
    graduationDate: string;
    description: string;
  }>;
  links: Array<{
    label: string;
    link: string;
  }>;
  skills: string[];
  languages: string[];
  professionalSummary: string;
  employmentHistory: Array<{
    jobTitle: string;
    startDate: string;
    endDate: string;
    employer: string;
    city: string;
    achievements: string[];
  }>;
  certificatesHistory: Array<{
    jobTitle: string;
    startDate: string;
    endDate: string;
    employer: string;
    achievements: string[];
  }>;
  passions: Array<{
    name: string;
    content: string;
  }>;
}

interface Props {
  initialData: CVData;
}

export default function CVContent({ initialData }: Props) {
  return (
    <div className="divide-y divide-border_color">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border_color p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Parcours Scolaire</h1>
        </div>
      </div>

      {/* Liste des formations */}
      <div className="divide-y divide-border_color">
        {/* Master MIAGE */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">Master MIAGE</h2>
            <span className="text-text_secondary">2024 - 2025</span>
          </div>
          <p className="text-text_secondary mb-4">IDMC (Institut des sciences du Digital, Management Cognition)</p>
          <ul className="space-y-2 text-text_primary">
            <li>Formation en mathématiques appliquées</li>
            <li>Gestion des systèmes d'information</li>
            <li>Management des entreprises</li>
            <li>Management des projets</li>
          </ul>
        </div>

        {/* BUT Informatique */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">BUT Informatique</h2>
            <span className="text-text_secondary">2021 - 2024</span>
          </div>
          <p className="text-text_secondary mb-4">IUT de Saint-Die-Des-Vosges</p>
          <ul className="space-y-2 text-text_primary">
            <li>Spécialisation en développement d'applications</li>
            <li>Projets pratiques en équipe</li>
            <li>Apprentissage des technologies web et mobiles</li>
            <li>Formation en informatique</li>
          </ul>
        </div>

        {/* Licence MIASHS */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">Licence MIASHS (Codiplomation)</h2>
            <span className="text-text_secondary">2024</span>
          </div>
          <p className="text-text_secondary mb-4">IDMC (Institut des sciences du Digital, Management Cognition)</p>
          <ul className="space-y-2 text-text_primary">
            <li>Formation en mathématiques appliquées</li>
            <li>Études des sciences cognitives</li>
            <li>Management des systèmes d'information</li>
          </ul>
        </div>

        {/* Baccalauréat */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">Baccalauréat Scientifique</h2>
            <span className="text-text_secondary">2021</span>
          </div>
          <p className="text-text_secondary mb-4">Lycée Pierre Mendes France | Epinal</p>
          <ul className="space-y-2 text-text_primary">
            <li>Spécialité Science de l'ingénieur</li>
            <li>Formation scientifique générale</li>
            <li>Projets techniques et pratiques</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 