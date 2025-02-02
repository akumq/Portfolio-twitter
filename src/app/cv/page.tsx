import React from 'react'
import Navigations from '../Components/Navigations/Navigations'
import Profile from '../Components/Navigations/Profile'
import SideBar from '../Components/Navigations/SideBar'
import CVContent from './CVContent'

interface CVData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  city: string;
  country: string;
  phone: string;
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

async function getCVData(): Promise<CVData> {
  const cvData: CVData = {
    firstName: 'Amadou',
    lastName: 'Sow',
    jobTitle: "Etudiant en Master MIAGE en Recherche d'Alternance",
    city: 'Nancy',
    country: 'France',
    phone: '+33781965497',
    email: 'madousow88@gmail.com',
    education: [
      {
        school: 'IUT Saint Die Des Vosges',
        degree: 'Diplome',
        graduationDate: '2024',
        description: 'BUT Informatique'
      },
      {
        school: 'Lycee Pierre Mendes France',
        degree: 'Lycee',
        graduationDate: '2020',
        description: "Bac S, Science de L'ingénieur"
      }
    ],
    links: [
      {
        label: 'GitHub',
        link: 'https://github.com/akumq'
      },
      {
        label: 'Linkedin',
        link: 'https://www.linkedin.com/in/amadou-sow-861765212/'
      }
    ],
    skills: [   
      'C# / net / ASP NET',
      'C / C++',
      'Lua',
      'Vulkan / OpenGL',
      'PHP',
      'Java', 
      'Node',
      'SQL',
      'GIT',
      'Docker',
      'Modélisation IA',
      'API-REST'
    ],
    languages: ['Francais: Native', 'Anglais: Toeic 870 / 990'],
    professionalSummary: `Je suis passionné par le digital. Grâce à mon parcours scolaire, j'ai acquis des compétences en algorithmique en gestion de projet et en anglais. Mon expérience en alternance m'a permis de mettre en pratique mes connaissances théoriques et de travailler efficacement en équipe.`,
    employmentHistory: [
      {
        jobTitle: 'Alternant Développeur Junior',
        startDate: 'Septembre 2022',
        endDate: 'Août 2024',
        employer: 'Prefabat',
        city: 'Le Kertoff',
        achievements: [
          "Conception et développement d'applications en C#, ASP.NET et VB.NET",
          "Coordination de projets de développement logiciel",
          "Administration et gestion des bases de données",
          "Conception et gestion de bases de données relationnelles",
          "Développement de modules personnalisés pour des sites WordPress",
          "Implémentation et personnalisation de Microsoft Dynamics NAV"
        ]
      },
      {
        jobTitle: 'Agent de quai manutentionnaire',
        startDate: 'été 2021',
        endDate: 'été 2021',
        employer: 'GLS France HUB',
        city: 'Île De France',
        achievements: [
          "Déchargement de camions",
          "pose des colis sur une chaine de tri",
          "Divers travaux de manutention"
        ]
      }
    ],
    certificatesHistory: [
      {
        jobTitle: 'BUT Informatique',
        startDate: '2024',
        endDate: '',
        employer: 'IUT de Saint-Die-Des-Vosges',
        achievements: ['IUT de Saint-Die-Des-Vosges']
      },
      {
        jobTitle: 'Licence MIASHS (Codiplomation)',
        startDate: '2024',
        endDate: '',
        employer: 'IDMC',
        achievements: ['IDMC (Institut des sciences du Digital, Management Cognition)']
      },
      {
        jobTitle: 'TOIEC',
        startDate: '2024',
        endDate: '',
        employer: '',
        achievements: ['Score: 870/990']
      },
      {
        jobTitle: "Baccalauréat Scientifique | Science de l'ingénieur",
        startDate: '2021',
        endDate: '',
        employer: 'Lycée Pierre Mendes France',
        achievements: ['Lycée Pierre Mendes France | Epinal']
      }
    ],
    passions: [
      {
        name: "Intelligence Artificielle",
        content: "Assez tôt, ce sujet m'a intéressé, aussi bien pour les questions morales qu'il pose, mais aussi pour les différentes applications technologiques qu'il permet. De l'agent de conversation au générateur d'image, l'IA est désormais partout. C'est un outil formidable avec tellement d'applications que n'importe quel secteur est concerné."
      },
      {
        name: "Jeux Vidéo",
        content: "J'utilise aussi bien les jeux vidéo comme un outil ludique ou comme un support de développement. Le jeu vidéo m'a permis de découvrir de nombreux domaines différents comme l'imagerie numérique, l'UI, l'UX, la modélisation 3D et plus encore. C'est un domaine pluridisciplinaire que j'affectionne et que je continue d'explorer."
      }
    ]
  };

  return cvData;
}

export default async function CVPage() {
  const cvData = await getCVData();

  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - responsive */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Navigations />
        <Profile />
      </SideBar>

      {/* Section principale - responsive */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-[72px] md:ml-[88px] lg:ml-0">
        <div className="w-full">
          <CVContent initialData={cvData} />
        </div>
      </section>

    </main>
  )
}