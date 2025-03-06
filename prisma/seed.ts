import { PrismaClient, ProjectType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Nettoyer la base de données
    await prisma.comment.deleteMany();
    await prisma.thread.deleteMany();
    await prisma.language.deleteMany();

    // Créer les projets
    const projects = [
        {
            title: "Noita Physics",
            content: "Une simulation physique inspirée du jeu Noita, implémentant des mécaniques de particules et d'interactions fluides en temps réel.",
            github: "https://github.com/akumq/noitaPhysics",
            types: [ProjectType.GAME, ProjectType.DIGITAL_IMAGING],
            languages: ["C++", "SFML", "CMake"]
        },
        {
            title: "Audio Transcription",
            content: "Application de transcription audio utilisant des modèles de reconnaissance vocale avancés pour convertir l'audio en texte avec une haute précision.",
            github: "https://github.com/akumq/audioTranscription",
            types: [ProjectType.MACHINE_LEARNING, ProjectType.WEB_APP],
            languages: ["Python", "Streamlit", "FFmpeg"]
        },
        {
            title: "Cloth Simulation",
            content: "Simulation de tissu interactive utilisant la méthode d'intégration de Verlet, permettant une simulation physique réaliste avec interactions utilisateur.",
            github: "https://github.com/akumq/clothSimulation",
            types: [ProjectType.DIGITAL_IMAGING, ProjectType.GAME],
            languages: ["C++", "SFML", "CMake"]
        },
        {
            title: "Portfolio Twitter",
            content: "Un portfolio moderne inspiré de l'interface de Twitter, avec un design épuré et une expérience utilisateur optimisée.",
            github: "https://github.com/akumq/portfolio-twitter",
            types: [ProjectType.WEB_APP],
            languages: ["TypeScript", "React", "TailwindCSS", "Prisma"]
        }
    ];

    // Créer les threads avec leurs langages
    for (const project of projects) {
        await prisma.thread.create({
            data: {
                title: project.title,
                content: project.content,
                github: project.github,
                types: project.types,
                languages: {
                    connectOrCreate: project.languages.map(lang => ({
                        where: { name: lang },
                        create: { name: lang }
                    }))
                }
            }
        });
    }

    // Création des catégories de compétences
    const categoryFrontend = await prisma.skillCategory.upsert({
        where: { name: 'frontend' },
        update: {},
        create: {
            name: 'frontend',
            title: 'Frontend',
            icon: '🎨',
            description: 'Technologies de développement frontend'
        }
    });

    const categoryBackend = await prisma.skillCategory.upsert({
        where: { name: 'backend' },
        update: {},
        create: {
            name: 'backend',
            title: 'Backend',
            icon: '⚙️',
            description: 'Technologies de développement backend'
        }
    });

    const categoryTools = await prisma.skillCategory.upsert({
        where: { name: 'tools' },
        update: {},
        create: {
            name: 'tools',
            title: 'Outils & Méthodes',
            icon: '🛠️',
            description: 'Outils et méthodologies de développement'
        }
    });

    // Création des compétences frontend
    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'React',
                categoryId: categoryFrontend.id
            }
        },
        update: {},
        create: {
            name: 'React',
            description: 'Développement d\'applications web modernes avec React et ses écosystèmes',
            formation: 'Autodidacte',
            categoryId: categoryFrontend.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'Next.js',
                categoryId: categoryFrontend.id
            }
        },
        update: {},
        create: {
            name: 'Next.js',
            description: 'Création de sites web performants avec le framework Next.js',
            formation: 'Autodidacte',
            categoryId: categoryFrontend.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'TypeScript',
                categoryId: categoryFrontend.id
            }
        },
        update: {},
        create: {
            name: 'TypeScript',
            description: 'Développement typé pour une meilleure maintenabilité',
            formation: 'BUT Informatique',
            categoryId: categoryFrontend.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'TailwindCSS',
                categoryId: categoryFrontend.id
            }
        },
        update: {},
        create: {
            name: 'TailwindCSS',
            description: 'Stylisation rapide et responsive avec TailwindCSS',
            formation: 'BUT Informatique',
            categoryId: categoryFrontend.id
        }
    });

    // Création des compétences backend
    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'Node.js',
                categoryId: categoryBackend.id
            }
        },
        update: {},
        create: {
            name: 'Node.js',
            description: 'Développement backend avec Node.js et Express',
            formation: 'Autodidacte',
            categoryId: categoryBackend.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'Python',
                categoryId: categoryBackend.id
            }
        },
        update: {},
        create: {
            name: 'Python',
            description: 'Développement d\'applications et scripts Python',
            formation: 'Autodidacte',
            categoryId: categoryBackend.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'PostgreSQL',
                categoryId: categoryBackend.id
            }
        },
        update: {},
        create: {
            name: 'PostgreSQL',
            description: 'Gestion de bases de données relationnelles',
            formation: 'Master MIAGE',
            categoryId: categoryBackend.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'Prisma',
                categoryId: categoryBackend.id
            }
        },
        update: {},
        create: {
            name: 'Prisma',
            description: 'ORM moderne pour TypeScript et Node.js',
            formation: 'Autodidacte',
            categoryId: categoryBackend.id
        }
    });

    // Création des compétences outils
    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'Git',
                categoryId: categoryTools.id
            }
        },
        update: {},
        create: {
            name: 'Git',
            description: 'Gestion de version et collaboration',
            formation: 'Autodidacte',
            categoryId: categoryTools.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'Docker',
                categoryId: categoryTools.id
            }
        },
        update: {},
        create: {
            name: 'Docker',
            description: 'Conteneurisation d\'applications',
            formation: 'BUT Informatique',
            categoryId: categoryTools.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'CI/CD',
                categoryId: categoryTools.id
            }
        },
        update: {},
        create: {
            name: 'CI/CD',
            description: 'Intégration et déploiement continus',
            formation: 'BUT Informatique',
            categoryId: categoryTools.id
        }
    });

    await prisma.skill.upsert({
        where: { 
            name_categoryId: {
                name: 'Agile/Scrum',
                categoryId: categoryTools.id
            }
        },
        update: {},
        create: {
            name: 'Agile/Scrum',
            description: 'Méthodologies de gestion de projet agile',
            formation: 'BUT Informatique / Master MIAGE',
            categoryId: categoryTools.id
        }
    });

    console.log('Base de données initialisée avec succès !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
