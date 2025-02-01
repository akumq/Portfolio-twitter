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
