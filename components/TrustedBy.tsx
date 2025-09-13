import { clients } from '@/lib/data/clients';
import Image from 'next/image';

export default function TrustedBy() {
  return (
    <section className="container mx-auto px-4 py-4 max-w-4xl hidden">
      <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
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
  );
}
