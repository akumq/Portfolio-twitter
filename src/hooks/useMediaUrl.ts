import { useState, useEffect } from 'react';

export function useMediaUrl(fileName: string | undefined | null) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    if (!fileName) {
      setUrl('');
      return;
    }

    const fetchUrl = async () => {
      try {
        const response = await fetch(`/api/medias/url?fileName=${encodeURIComponent(fileName)}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération de l\'URL');
        const data = await response.json();
        setUrl(data.url);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'URL:', error);
        setUrl('');
      }
    };

    fetchUrl();
  }, [fileName]);

  return url;
} 