export type Client = {
  name: string;
  href: string;
  logo: string;
  alt: string;
};

export const clients: Client[] = [
  { name: 'Infinidat', href: 'https://www.infinidat.com', logo: '/images/clients/inf.png', alt: 'Infinidat' },
  { name: 'VTB', href: 'https://www.vtb.com', logo: '/images/clients/vtb.png', alt: 'VTB' },
  { name: 'Innotech', href: 'https://inno.tech', logo: '/images/clients/inno.png', alt: 'Innotech' },
  { name: 'Empl.ai', href: 'https://empl.ai', logo: '/images/clients/emp.png', alt: 'Empl.ai' },
];
