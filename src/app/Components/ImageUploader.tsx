'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ImageUploader({ onUpload, threadId }: { 
  onUpload: (imageId: string) => void
  threadId?: number 
}) {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      const newPreviews: string[] = [];
      
      Array.from(files).forEach(file => {
        formData.append('file', file);
        newPreviews.push(URL.createObjectURL(file));
      });
      
      setPreviews(newPreviews);
      
      // Utilisation de la route /api/medias/upload
      const response = await fetch(`/api/medias/upload${threadId ? `?threadId=${threadId}` : ''}`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.id) {
        onUpload(result.id);
      } else if (result.error) {
        console.error('Upload error:', result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input 
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-text_highlight file:text-white
          hover:file:bg-text_highlight/90"
      />
      {previews.map((preview, index) => (
        <div key={index} className="mt-4">
          <Image 
            src={preview} 
            alt={`Preview ${index + 1}`}
            width={320}
            height={180}
            className="max-h-40 rounded-lg object-cover"
            loader={({ src }) => src}
          />
        </div>
      ))}
    </div>
  );
} 