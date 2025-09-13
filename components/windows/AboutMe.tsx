
import React from 'react';
import { profile } from '@/lib/data/profile';
import { coreSkills } from '@/lib/data/skills';
import { InlineChat } from '@/components/InlineChat';
import {
  LinkedinLogo,
  GithubLogo,
  WhatsappLogo,
  EnvelopeSimple,
  Phone,
  CalendarPlus,
} from "@phosphor-icons/react/dist/ssr";

const AboutMe = () => {
  return (
    <div className="text-center flex flex-col h-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold mb-1">{profile.name}</h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-1 font-body">{profile.role}</p>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 font-heading">{profile.hook}</p>

        <nav className="flex gap-4 justify-center mb-3 sm:mb-4">
          {profile.socials.map((social) => (
            <a
              key={social.id}
              href={social.href}
              className="social-link"
              aria-label={social.label}
              title={social.label}
              target={social.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
            >
              {social.id === 'linkedin' && <LinkedinLogo size={24} />}
              {social.id === 'github' && <GithubLogo size={24} />}
              {social.id === 'whatsapp' && <WhatsappLogo size={24} />}
              {social.id === 'email' && <EnvelopeSimple size={24} />}
              {social.id === 'phone' && <Phone size={24} />}
              {social.id === 'calendly' && <CalendarPlus size={24} />}
            </a>
          ))}
        </nav>

        <div className="mb-2 sm:mb-3">
          <div className="flex flex-wrap gap-1 justify-center">
            {coreSkills.slice(0, 6).map((skill, index) => (
              <span 
                key={skill} 
                className="skill-pill core text-xs sm:text-sm px-2 py-1"
              >
                {skill.replace('Full-Stack', 'FullStack').replace('LLM & Prompt-Ops', 'LLM/Prompt')}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 mb-2">
        <InlineChat />
      </div>
    </div>
  );
};

export default AboutMe;
