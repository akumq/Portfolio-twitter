import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Créer des utilisateurs

    // Créer des threads
    const thread1 = await prisma.thread.create({
        data: {
            title: 'Premier fil de discussion',
            content: 'Ceci est le contenu du premier fil.',
            imageUrl: 'https://pbs.twimg.com/media/Gh6aZwHW4AEyr7r?format=jpg&name=900x900',
        },
    });

    const thread2 = await prisma.thread.create({
        data: {
            title: 'Deuxième fil de discussion',
            content: 'Ceci est le contenu du deuxième fil.',
            imageUrl: 'https://pbs.twimg.com/media/Gh6aZwHW4AEyr7r?format=jpg&name=900x900',
        },
    });

    console.log({ thread1, thread2 });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
