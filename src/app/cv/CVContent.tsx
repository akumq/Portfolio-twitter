'use client';

import React from 'react';

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

interface Props {
  initialData: CVData;
}

export default function CVContent({ initialData }: Props) {
  return (
    <div className="divide-y divide-border_color">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border_color p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{initialData.firstName} {initialData.lastName}</h1>
          <span className="text-text_secondary">{initialData.jobTitle}</span>
        </div>
      </div>

      {/* Section Principale */}
      <div className="p-4 space-y-6">
        {/* Formation */}
        <section>
          <h2 className="text-lg font-bold mb-4">Formation</h2>
          <div className="space-y-4">
            {initialData.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-text_highlight pl-4">
                <h3 className="font-semibold">{edu.school}</h3>
                <p className="text-sm text-text_secondary">{edu.degree} - {edu.graduationDate}</p>
                <p className="mt-1">{edu.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Expérience Professionnelle */}
        <section>
          <h2 className="text-lg font-bold mb-4">Expérience Professionnelle</h2>
          <div className="space-y-4">
            {initialData.employmentHistory.map((job, index) => (
              <div key={index} className="border-l-2 border-text_highlight pl-4">
                <h3 className="font-semibold">{job.jobTitle}</h3>
                <p className="text-sm text-text_secondary">
                  {job.employer} • {job.startDate} - {job.endDate}
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {job.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Compétences */}
        <section>
          <h2 className="text-lg font-bold mb-4">Compétences Techniques</h2>
          <div className="flex flex-wrap gap-2">
            {initialData.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-background border border-border_color rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section>
          <h2 className="text-lg font-bold mb-4">Certifications</h2>
          <div className="space-y-2">
            {initialData.certificatesHistory.map((cert, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{cert.jobTitle}</h3>
                  <p className="text-sm text-text_secondary">{cert.employer}</p>
                </div>
                <span className="text-sm text-text_secondary">{cert.startDate}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 