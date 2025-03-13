import { Suspense } from 'react';
import CVContent from './CVContent';
import DesktopNav from '../Components/Navigations/DesktopNav';

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

async function getCVData(): Promise<CVData> {
  const cvData: CVData = {
    firstName: 'Amadou',
    lastName: 'Sow',
    jobTitle: "Etudiant en Master MIAGE en Recherche d'Alternance",
    city: 'Nancy',
    country: 'France',
    email: 'madousow88@gmail.com',
    education: [
      {
        school: 'IDMC Nancy',
        degree: 'Master MIAGE',
        graduationDate: '2024',
        description: 'Institut des sciences du Digital, Management et Cognition'
      }
    ],
    links: [
        {
        label: 'GitHub',
        link: 'https://github.com/akumq'
      },
      {
        label : 'Linkedin',
        link : 'https://www.linkedin.com/in/sow-amadou1/'
      }
    ],
    skills: [   
      '<b>Java / Spring Boot</b>',
      '<b>C# / net / ASP NET</b>',
      'C / C++',
      'Lua',
      'Vulkan / OpenGL',
      'NodeJS',
      '<b>SQL / MySQL / PostgreSQL</b>',
      '<b>GIT</b>',
      '<b>Docker / Kubernetes</b>',
      'Modélisation IA',
      'API-REST',
      '<b>SCRUM / AGILE / LEAN</b>',
    ],
    languages: ['Francais: Native','Anglais: Toeic 870 / 990'],
    professionalSummary: `Je suis passionné par le digital. Grâce à mon parcours scolaire, j'ai acquis des compétences en algorithmique en gestion de projet et en anglais. Mon expérience en alternance m'a permis de mettre en pratique mes connaissances théoriques et de travailler efficacement en équipe. Je vise à créer des solutions innovantes et à contribuer activement à la réussite des projets en maîtrisant de nombreuses technologies différentes.`,
    employmentHistory: [
      {
        jobTitle: 'Alternant Développeur Junior',
        startDate: 'Septembre 2022',
        endDate: 'Août 2024',
        employer: 'Prefabat',
        city: 'Le Kertoff',
        achievements: [
          "Conception et développement d'applications en <b>C#, ASP.NET et VB.NET</b>",
          "Coordination de projets de développement logiciel",
          "Administration et gestion des bases de données,",
          "Conception et gestion de bases de données relationnelles ",
          "Développement de modules personnalisés pour des sites WordPress",
          "Implémentation et personnalisation de <b>Microsoft Dynamics NAV</b>"
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
      },
    ],
    certificatesHistory: [
      {
        jobTitle: 'BUT Informatique',
        startDate: '2024',
        endDate: '',
        employer: '',
        achievements: [
          'IUT de Saint-Die-Des-Vosges ',
        ]
      },
      {
        jobTitle: 'Licence MIASHS (Codiplomation)',
        startDate: '2024',
        endDate: '',
        employer: '',
        achievements: [
          'IDMC (Institut des sciences du Digital, Management Cognition°'
        ]
      },
      {
        jobTitle: 'TOIEC (Test of English for International Communication)',
        startDate: '2024',
        endDate: '',
        employer: '',
        achievements: [
          'Score: 870/990',
        ]
      },
      {
        jobTitle: "Baccalauréat Scientifique| Science de l'ingénieur",
        startDate: '2021',
        endDate: '',
        employer: '',
        achievements: [ 
          'Lycée Pierre Mendes France | Epinal ',
        ]
      }
    ],
    passions: [
      {
        name: "Intelligence Artificielle",
        content: "Assez tôt, ce sujet m'a intéressé, aussi bien pour les questions morales qu'il pose, mais aussi pour les différentes applications technologiques qu'il permet. De l'agent de conversation au générateur d'image, l'IA est désormais partout. C'est un outil formidable avec tellement d'applications que n'importe quel secteur est concerné.",
      },
      {
        name: "Jeux Vidéo",
        content: "J'utilise aussi bien les jeux vidéo comme un outil ludique ou comme un support de développement. Le jeu vidéo m'a permis de découvrir de nombreux domaines différents comme l'imagerie numérique, l'UI, l'UX, la modélisation 3D et plus encore. C'est un domaine pluridisciplinaire que j'affectionne et que je continue d'explorer."
      }
    ],
  }


  return cvData;
}

export default async function CVPage() {
  const initialData = await getCVData();

  return (
    <main className="flex min-h-screen bg-background flex-row max-w-7xl mx-auto">
      {/* Barre latérale - masquée sur mobile */}
      <Suspense fallback={<div className="hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen bg-background animate-pulse" />}>
        <DesktopNav />
      </Suspense>

      {/* Section principale */}
      <section className="flex-1 border-x border-border_color min-w-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 pb-20 sm:pb-0 mt-14 sm:mt-0">
        <Suspense fallback={
          <div className="animate-pulse p-4 space-y-4">
            <div className="h-48 bg-secondary rounded-lg" />
            <div className="h-24 bg-secondary rounded-lg" />
            <div className="h-36 bg-secondary rounded-lg" />
          </div>
        }>
          <CVContent initialData={initialData} />
        </Suspense>
      </section>
    </main>
  );
}