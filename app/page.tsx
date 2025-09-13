
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
      <section className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <div className="text-center mb-4 sm:mb-6">
          {/* <div className="inline-block px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full mb-4">
            {profile.hiringBadge}
          </div> */}
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
                {social.id === 'blog' && <Book size={24} />}
              </a>
            ))}
          </nav>

          <div className="mb-2 sm:mb-3">
            {/* <h3 className="text-lg font-semibold mb-4">Core Expertise</h3> */}
            <div className="flex flex-wrap gap-2 justify-center">
              {coreSkills.slice(0, 6).map((skill) => (
                <span key={skill} className="skill-pill core">
                  {skill}
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