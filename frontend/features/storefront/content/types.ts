export type ContentSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  publishedAt: string;
  readTime: string;
  sections: ContentSection[];
};

export type PortfolioProject = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  client: string;
  year: string;
  sections: ContentSection[];
};

export type AboutPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  since: string;
  heading: string;
  paragraphs: string[];
  values: Array<{ title: string; text: string }>;
  howWeWork: { heading: string; text: string };
};

export type ServicesPageContent = {
  cards: Array<{ title: string; image: string; description: string }>;
  heading: string;
  subheading: string;
  services: Array<{ name: string; icon: string; description: string }>;
  unlimitedSection: {
    title: string;
    text: string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
};

export type FaqItem = {
  question: string;
  answer: string;
  category?: string;
};

export type FaqPageContent = {
  title: string;
  introHeading: string;
  introText: string;
  items: FaqItem[];
};

export type ContactPageContent = {
  title: string;
  sidebarTitle: string;
  sidebarDescription: string;
  address: string;
  email: string;
  phone: string;
  workingHours: string;
  storeNotice: string;
};

export type ContactInput = {
  name: string;
  email: string;
  subject?: string;
  phone?: string;
  message: string;
};
