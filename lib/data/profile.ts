export type Social = {
  id: 'linkedin' | 'github' | 'whatsapp' | 'email' | 'phone' | 'calendly' | 'blog';
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  role: string;
  hook: string;
  hiringBadge: string;
  socials: Social[];
};

export const profile: Profile = {
  name: 'Alex Chernysh',
  role: 'AI & Glue Engineer',
  hook: 'Black‑box chaos in your stack? I build the calm layer.',
  hiringBadge: "SEP'25",
  socials: [
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/sasha-chernysh/' },
    { id: 'github', label: 'GitHub', href: 'https://github.com/chernistry' },
    { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/972505357563' },
    { id: 'email', label: 'Email', href: 'mailto:alex@hireex.ai' },
    { id: 'phone', label: 'Phone', href: 'tel:+972505357563' },
    { id: 'calendly', label: 'Book a Call', href: 'https://calendly.com/alexchernysh/15min' },
    // { id: 'blog', label: 'Blog', href: '/blog' },
  ],
};
