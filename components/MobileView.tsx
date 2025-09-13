
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
import TrustedBy from './TrustedBy';

const MobileView = () => {
  return (
    <div className="w-screen h-screen bg-cover bg-center overflow-hidden" style={{backgroundImage: "url('/images/wallpaper.jpg')"}}>
      <section className="h-full flex flex-col justify-center px-2 py-1">
        <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl p-3 flex-1 flex flex-col justify-center max-h-[95vh]">
          <div className="text-center mb-3">
            <h1 className="text-xl font-heading font-semibold mb-1">{profile.name}</h1>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-1 font-body">{profile.role}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-heading">{profile.hook}</p>

            <nav className="flex gap-3 justify-center mb-2">
              {profile.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-500 hover:text-white transition-colors text-gray-600 dark:text-gray-300"
                  aria-label={social.label}
                  title={social.label}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                >
                  {social.id === 'linkedin' && <LinkedinLogo size={18} />}
                  {social.id === 'github' && <GithubLogo size={18} />}
                  {social.id === 'whatsapp' && <WhatsappLogo size={18} />}
                  {social.id === 'email' && <EnvelopeSimple size={18} />}
                  {social.id === 'phone' && <Phone size={18} />}
                  {social.id === 'calendly' && <CalendarPlus size={18} />}
                </a>
              ))}
            </nav>

            <div className="mb-3">
              <div className="flex flex-wrap gap-1 justify-center">
                {coreSkills.slice(0, 6).map((skill) => (
                  <span 
                    key={skill} 
                    className="skill-pill core text-xs px-2 py-1"
                  >
                    {skill.replace('Full-Stack', 'FullStack').replace('LLM & Prompt-Ops', 'LLM/Prompt')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <InlineChat />
          </div>
        </div>
      </section>
    </div>
  );
};

export default MobileView;
