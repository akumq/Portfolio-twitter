import { prisma } from '@/lib/prisma';

export async function storeImage(file: Blob, threadId?: number) {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  return prisma.image.create({
    data: {
      data: buffer,
      mimeType: file.type,
      threadId: threadId || null
    }
  });
}

export async function getImage(id: string) {
  return prisma.image.findUnique({
    where: { id }
  });
}

export async function getImagesByThread(threadId: number) {
  return prisma.image.findMany({
    where: { threadId }
  });
} 