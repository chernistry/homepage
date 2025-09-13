
import { profile } from '@/lib/data/profile';
import { coreSkills } from '@/lib/data/skills';
import { clients } from '@/lib/data/clients';
import Image from 'next/image';
import TrustedBy from '@/components/TrustedBy';
import { InlineChat } from '@/components/InlineChat';
import {
  LinkedinLogo,
  GithubLogo,
  WhatsappLogo,
  EnvelopeSimple,
  Phone,
  CalendarPlus,
  Book,
} from "@phosphor-icons/react/dist/ssr";

export default async function HomePage() {
  return (
    <>
      <section className="container mx-auto px-3 py-0 sm:py-6 max-w-3xl h-[calc(100vh-29px)] sm:h-auto flex flex-col justify-center">
        <div className="glass rounded-2xl p-2 sm:p-8 text-center flex-1 flex flex-col justify-center sm:flex-none sm:block sm:mb-6 mt-1 sm:mt-0">
          {/* <div className="inline-block px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full mb-4">
            {profile.hiringBadge}
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold mb-1">{profile.name}</h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-1 font-body animate-in fade-in-50 slide-in-from-top-2 duration-1000 delay-300">{profile.role}</p>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 font-heading animate-in fade-in-50 slide-in-from-top-2 duration-1000 delay-400">{profile.hook}</p>

          <nav className="flex gap-4 justify-center mb-3 sm:mb-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-1000 delay-500">
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
                {/* {social.id === 'blog' && <Book size={24} />} */}
              </a>
            ))}
          </nav>

          <div className="mb-2 sm:mb-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-1000 delay-600">
            {/* <h3 className="text-lg font-semibold mb-4">Core Expertise</h3> */}
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

          <InlineChat />
        </div>
      </section>
      
      <TrustedBy />
      
    </>
  );
}