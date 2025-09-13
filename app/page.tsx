
import { profile } from '@/lib/data/profile';
import { coreSkills } from '@/lib/data/skills';
import { clients } from '@/lib/data/clients';
import Image from 'next/image';
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
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full mb-4">
            {profile.hiringBadge}
          </div>
          <h1 className="text-5xl font-bold mb-4">{profile.name}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">{profile.role}</p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">{profile.hook}</p>

          <nav className="flex gap-4 justify-center mb-8">
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

          <div className="mb-8">
            {/* <h3 className="text-lg font-semibold mb-4">Core Expertise</h3> */}
            <div className="flex flex-wrap gap-2 justify-center">
              {coreSkills.slice(0, 6).map((skill) => (
                <span key={skill} className="skill-pill core">
                  {skill}
                </span>
              ))}
            </div>
          </div>



          <div className="mt-8 max-w-md mx-auto">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="ai-chat-input"
            >
              Ask AI About Me
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="ai-chat-input"
                type="text"
                className="w-full rounded border p-2 text-sm bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="e.g., What is Alex's experience with Python?"
              />
              <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                Ask
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
          Trusted By
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {clients.map((client) => (
            <a
              key={client.name}
              href={client.href}
              target="_blank"
              rel="noreferrer"
              title={client.name}
            >
              <Image
                src={client.logo}
                alt={client.alt}
                width={100}
                height={40}
                className="object-contain client-logo"
              />
            </a>
          ))}
        </div>
      </section>
      
    </>
  );
}