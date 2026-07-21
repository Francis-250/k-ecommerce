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
