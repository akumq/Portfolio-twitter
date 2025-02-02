'use client';

import React from 'react';

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

interface Props {
  initialData: CVData;
}

export default function CVContent({ initialData }: Props) {
  return (
    <div className="w-full h-screen">
      {/* En-tête fixe */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border_color">
        <div className="flex items-center gap-4 px-4 py-3">
          <button className="p-2 hover:bg-secondary/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Curriculum Vitae</h1>
        </div>
      </header>

      {/* Contenu scrollable */}
      <div className="h-[calc(100vh-53px)] overflow-y-auto">
        {/* Profil */}
        <div className="px-4 py-3 border-b border-border_color">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{initialData.firstName} {initialData.lastName}</h2>
              <p className="text-text_secondary mt-1">{initialData.jobTitle}</p>
              <div className="mt-3 text-text_secondary space-y-2">
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text_secondary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {initialData.city}, {initialData.country}
                </p>
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text_secondary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {initialData.phone}
                </p>
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text_secondary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {initialData.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {initialData.links.map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-text_highlight text-white rounded-full font-bold hover:bg-text_highlight/90 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* À propos */}
        <div className="px-4 py-3 border-b border-border_color">
          <p className="text-text_secondary whitespace-pre-line">{initialData.professionalSummary}</p>
        </div>

        {/* Sections principales */}
        <div className="divide-y divide-border_color">
          {/* Compétences et Langues */}
          <div className="px-4 py-3">
            <h3 className="text-lg font-bold text-foreground mb-4">Compétences & Langues</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {initialData.skills.map((skill, index) => (
                  <span key={index} className="bg-secondary/10 text-text_highlight px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {initialData.languages.map((language, index) => (
                  <span key={index} className="bg-secondary/10 text-text_highlight px-3 py-1 rounded-full text-sm">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Expérience professionnelle */}
          <div className="px-4 py-3">
            <h3 className="text-lg font-bold text-foreground mb-4">Expérience professionnelle</h3>
            <div className="space-y-6">
              {initialData.employmentHistory.map((job, index) => (
                <div key={index} className="hover:bg-secondary/5 -mx-4 px-4 py-3 transition-colors">
                  <h4 className="font-bold text-foreground">{job.jobTitle}</h4>
                  <p className="text-text_secondary">{job.employer}, {job.city}</p>
                  <p className="text-sm text-text_secondary mb-2">{job.startDate} - {job.endDate}</p>
                  <ul className="space-y-1">
                    {job.achievements.map((achievement, i) => (
                      <li key={i} className="text-text_secondary pl-4 relative before:content-['•'] before:absolute before:left-0">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Formation */}
          <div className="px-4 py-3">
            <h3 className="text-lg font-bold text-foreground mb-4">Formation</h3>
            <div className="space-y-4">
              {initialData.education.map((edu, index) => (
                <div key={index} className="hover:bg-secondary/5 -mx-4 px-4 py-3 transition-colors">
                  <h4 className="font-bold text-foreground">{edu.degree}</h4>
                  <p className="text-text_secondary">{edu.school}</p>
                  <p className="text-sm text-text_secondary">{edu.graduationDate}</p>
                  <p className="text-text_secondary mt-1">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="px-4 py-3">
            <h3 className="text-lg font-bold text-foreground mb-4">Certifications</h3>
            <div className="space-y-4">
              {initialData.certificatesHistory.map((cert, index) => (
                <div key={index} className="hover:bg-secondary/5 -mx-4 px-4 py-3 transition-colors">
                  <h4 className="font-bold text-foreground">{cert.jobTitle}</h4>
                  <p className="text-text_secondary">{cert.employer}</p>
                  <p className="text-sm text-text_secondary">{cert.startDate}</p>
                  <ul className="space-y-1">
                    {cert.achievements.map((achievement, i) => (
                      <li key={i} className="text-text_secondary pl-4 relative before:content-['•'] before:absolute before:left-0">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Centres d'intérêt */}
          <div className="px-4 py-3">
            <h3 className="text-lg font-bold text-foreground mb-4">Centres d'intérêt</h3>
            <div className="space-y-4">
              {initialData.passions.map((interest, index) => (
                <div key={index} className="hover:bg-secondary/5 -mx-4 px-4 py-3 transition-colors">
                  <h4 className="font-bold text-foreground">{interest.name}</h4>
                  <p className="text-text_secondary">{interest.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 