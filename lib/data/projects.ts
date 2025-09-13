export type Project = {
  title: string;
  icon?: string;
  description?: string;
  href?: string;
  techTags?: string[];
};

export const projects: Project[] = [
  {
    title: 'Voyant',
    icon: '🧭',
    description: 'Fact-grounded travel assistant w/ NER→LLM→Rules, Deep web search, Vectara RAG & anti-hallucination.',
    href: 'https://chernistry.github.io/voyant/',
    techTags: ['Python', 'LangChain', 'Vectara', 'NER']
  },
  {
    title: 'E²A',
    icon: '🚛',
    description: 'AI-powered SLA monitoring and invoice validation for logistics operations.',
    href: 'https://github.com/chernistry/octup-e2a/',
    techTags: ['Python', 'AI', 'SLA Monitoring']
  },
  {
    title: 'Meulex',
    icon: '💬',
    description: 'Slack-native, compliance-aware agentic RAG copilot boilerplate.',
    href: 'https://github.com/chernistry/meulex',
    techTags: ['Slack API', 'RAG', 'Compliance']
  },
  {
    title: 'Sentio',
    icon: '🔗',
    description: 'Modular LangGraph RAG w/ hybrid retrieval, Qdrant & RAGAS eval.',
    href: 'https://github.com/chernistry/sentio-vnext',
    techTags: ['LangGraph', 'Qdrant', 'RAGAS']
  },
  {
    title: 'SYNAPSE AI Dev Framework',
    icon: '💡',
    description: 'Adaptive, risk-aware engineering approach.',
    href: '/synapse_paper',
    techTags: ['Framework', 'AI Development']
  }
];

export const moreProjects: Project[] = [
  {
    title: 'HR/BI automation',
    icon: '👥',
    description: 'Feedback loop shrank from 4 days → <1 day; offer cycle <5 days.',
    techTags: ['Python', 'BI', 'Automation']
  },
  {
    title: 'Oh My Repos',
    icon: '🔍',
    description: 'Semantic hybrid BM25+vector search for GitHub repos.',
    href: 'https://github.com/chernistry/ohmyrepos',
    techTags: ['Search', 'Vector DB', 'GitHub API']
  },
  {
    title: 'SaaS cost management',
    icon: '⚙️',
    description: 'Built custom connectors for SaaS cost management & analysis.',
    techTags: ['Connectors', 'Cost Analysis']
  },
  {
    title: 'VMware automation',
    icon: '🖥️',
    description: 'Developed Python/Terraform tools for VMware provisioning automation.',
    techTags: ['Python', 'Terraform', 'VMware']
  },
  {
    title: 'CI/CD pipelines',
    icon: '🔧',
    description: 'Designed & managed CI/CD pipelines (Jenkins JobDSL, GitLab CI) for IaC.',
    techTags: ['Jenkins', 'GitLab CI', 'IaC']
  },
  {
    title: 'Secure infrastructure',
    icon: '🛡️',
    description: 'Engineered ephemeral Linux distros & secure comms for high-privacy clients.',
    techTags: ['Linux', 'Security', 'Privacy']
  },
  {
    title: 'Media pipelines',
    icon: '🎙️',
    description: 'Directed media (TV/Radio) pipelines & B2B integrations for a 700k+ weekly reach.',
    techTags: ['Media', 'B2B Integration']
  },
  {
    title: 'Pro audio automation',
    icon: '🎵',
    description: 'Expertise in pro audio (DAWs, studio hardware) & multi-track automation.',
    techTags: ['Audio', 'DAW', 'Automation']
  }
];
