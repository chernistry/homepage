import ChatWidget from '@/components/ChatWidget';
import WindowHost from '@/components/windows/WindowHost';
import { profile } from '@/lib/data/profile';
import { coreSkills } from '@/lib/data/skills';

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
            {profile.socials.map(social => (
              <a
                key={social.id}
                href={social.href}
                className="social-link"
                aria-label={social.label}
                title={social.label}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {social.id === 'linkedin' && '💼'}
                {social.id === 'github' && '💻'}
                {social.id === 'whatsapp' && '📱'}
                {social.id === 'email' && '✉️'}
                {social.id === 'phone' && '📞'}
                {social.id === 'calendly' && '📅'}
                {social.id === 'blog' && '📝'}
              </a>
            ))}
          </nav>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Core Expertise</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {coreSkills.slice(0, 6).map(skill => (
                <span key={skill} className="skill-pill core">{skill}</span>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click the dock icons below to explore my work →
          </p>
        </div>
      </section>
      <ChatWidget />
      <WindowHost />
    </>
  );
}
