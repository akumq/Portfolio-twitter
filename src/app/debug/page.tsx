'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { User } from '@prisma/client';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<User[] | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status]);

  return (
    <div className="container mx-auto p-8 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Page de Débogage</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Status de Session</h2>
          <pre className="bg-gray-900 p-4 rounded border border-gray-700 text-gray-300 overflow-auto">
            {JSON.stringify({ status }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Données de Session</h2>
          <pre className="bg-gray-900 p-4 rounded border border-gray-700 text-gray-300 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Données Utilisateur</h2>
          <pre className="bg-gray-900 p-4 rounded border border-gray-700 text-gray-300 overflow-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 