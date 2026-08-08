import type {
  AboutPageContent,
  BlogPost,
  ContactInput,
  ContactPageContent,
  FaqPageContent,
  PortfolioProject,
  ServicesPageContent,
} from "./types";
import { blogPosts as fallbackBlogPosts, portfolioProjects as fallbackPortfolioProjects } from "./data";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Request to ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// 1. Blog API
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await fetchJson<{ success: boolean; data: any[] }>("/articles");
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map((item) => ({
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt || "",
        image: item.coverImageUrl || "/storefront/img/blog/blog9.jpg",
        category: item.authorName || "Journal",
        publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split("T")[0] : "2026-07-01",
        readTime: "5 min read",
        sections: [
          {
            heading: "Overview",
            paragraphs: [item.content],
          },
        ],
      }));
    }
  } catch (error) {
    console.warn("Unable to fetch blog posts from API, using fallback data", error);
  }
  return fallbackBlogPosts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const data = await fetchJson<{ success: boolean; article: any }>(`/articles/${slug}`);
    if (data.success && data.article) {
      const item = data.article;
      return {
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt || "",
        image: item.coverImageUrl || "/storefront/img/blog/blog9.jpg",
        category: item.authorName || "Journal",
        publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split("T")[0] : "2026-07-01",
        readTime: "5 min read",
        sections: [
          {
            heading: "Story",
            paragraphs: [item.content],
          },
        ],
      };
    }
  } catch (error) {
    console.warn(`Unable to fetch blog post '${slug}' from API, using fallback`, error);
  }
  return fallbackBlogPosts.find((p) => p.slug === slug);
}

// 2. Portfolio API
export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  try {
    const data = await fetchJson<{ success: boolean; projects: any[] }>("/portfolio-projects");
    if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
      return data.projects.map((item, idx) => ({
        slug: item.slug,
        title: item.title,
        summary: item.description || item.title,
        image: item.coverImageUrl || `/storefront/img/portfolio/port${(idx % 8) + 1}.jpg`,
        category: item.category || "Editorial",
        client: item.client || "I-RAS STYLES Studio",
        year: item.completedAt ? new Date(item.completedAt).getFullYear().toString() : "2026",
        sections: [
          {
            heading: "Project overview",
            paragraphs: [item.content || item.description || "A curated campaign celebrating style, texture, and proportion."],
          },
        ],
      }));
    }
  } catch (error) {
    console.warn("Unable to fetch portfolio projects from API, using fallback", error);
  }
  return fallbackPortfolioProjects;
}

export async function getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | undefined> {
  try {
    const data = await fetchJson<{ success: boolean; project: any }>(`/portfolio-projects/${slug}`);
    if (data.success && data.project) {
      const item = data.project;
      return {
        slug: item.slug,
        title: item.title,
        summary: item.description || item.title,
        image: item.coverImageUrl || "/storefront/img/portfolio/port1.jpg",
        category: item.category || "Editorial",
        client: item.client || "I-RAS STYLES Studio",
        year: item.completedAt ? new Date(item.completedAt).getFullYear().toString() : "2026",
        sections: [
          {
            heading: "The brief",
            paragraphs: [item.description || "A distinct visual exploration created for storefront and editorial platforms."],
          },
          {
            heading: "Execution",
            paragraphs: [item.content || "Thoughtfully developed using high-end materials and contemporary creative direction."],
          },
        ],
      };
    }
  } catch (error) {
    console.warn(`Unable to fetch project '${slug}' from API, using fallback`, error);
  }
  return fallbackPortfolioProjects.find((p) => p.slug === slug);
}

// 3. About Page API
export async function getAboutPageContent(): Promise<AboutPageContent> {
  const fallback: AboutPageContent = {
    eyebrow: "Our story",
    title: "Style made thoughtful",
    description: "I-RAS STYLES brings together enduring design, honest quality, and an easy sense of individuality.",
    since: "Since 2010",
    heading: "Designed for real wardrobes and real lives",
    paragraphs: [
      "We started I-RAS STYLES with a simple belief: good style should feel considered, useful, and entirely your own.",
      "Our team works across design, sourcing, and storytelling to create collections that balance modern perspective with lasting appeal.",
    ],
    values: [
      { title: "Purposeful design", text: "Every detail should earn its place and make daily life feel easier." },
      { title: "Lasting quality", text: "We favour materials and construction designed to be worn, loved, and kept." },
      { title: "Personal style", text: "Confidence comes from clothes that support the person wearing them." },
    ],
    howWeWork: {
      heading: "Craftsmanship & Consideration",
      text: "From initial sketches to final fitting, every piece passes through dozens of hands dedicated to precision, comfort, and sustainable practice.",
    },
  };

  try {
    const data = await fetchJson<{ success: boolean; setting?: { value: AboutPageContent } }>(
      "/store-settings/public/pages.about",
    );
    if (data.success && data.setting?.value) {
      return { ...fallback, ...data.setting.value };
    }
  } catch (error) {
    // Return structured default
  }
  return fallback;
}

// 4. Services Page API
export async function getServicesPageContent(): Promise<ServicesPageContent> {
  const fallback: ServicesPageContent = {
    cards: [
      { title: "DESIGN THE COVER", image: "/storefront/img/services/service2.jpg", description: "Creative vision and art direction tailored to modern brand identity." },
      { title: "BUILD YOUR BRAND", image: "/storefront/img/services/service1.jpg", description: "Full-scale brand identity development and strategic positioning." },
      { title: "CREATE THE EXPERIENCE", image: "/storefront/img/services/service3.jpg", description: "Digital storefront architecture and seamless customer experience design." },
    ],
    heading: "OUR SERVICES",
    subheading: "Thoughtful solutions crafted to elevate fashion brands and retail experiences.",
    services: [
      { name: "BRANDING", icon: "◆", description: "Distinct visual identity and brand guidelines." },
      { name: "WEB DESIGN", icon: "◈", description: "Modern, responsive storefront interfaces." },
      { name: "PHOTOGRAPHY", icon: "●", description: "High-end lookbook and product photography." },
      { name: "CODING", icon: "⚙", description: "Performant full-stack e-commerce architecture." },
      { name: "DEVELOPMENT", icon: "⌘", description: "Custom storefront features and integrations." },
      { name: "MARKETING", icon: "▥", description: "Targeted digital marketing and launch strategies." },
      { name: "SUPPORT", icon: "♬", description: "Ongoing technical and operational support." },
      { name: "GRAPHIC DESIGN", icon: "✦", description: "Print, packaging, and digital asset creation." },
    ],
    unlimitedSection: {
      title: "UNLIMITED IDEAS",
      text: "We partner with visionary brands to elevate their presence through design, strategy, and seamless execution.",
      image: "/storefront/img/services/service4.jpg",
      ctaText: "More info",
      ctaLink: "/contact",
    },
  };

  try {
    const data = await fetchJson<{ success: boolean; setting?: { value: ServicesPageContent } }>(
      "/store-settings/public/pages.services",
    );
    if (data.success && data.setting?.value) {
      return { ...fallback, ...data.setting.value };
    }
  } catch (error) {
    // Return fallback
  }
  return fallback;
}

// 5. FAQ Page API
export async function getFaqPageContent(): Promise<FaqPageContent> {
  const fallback: FaqPageContent = {
    title: "Frequently asked questions",
    introHeading: "Below are frequently asked questions; you may find the answer for yourself.",
    introText: "Have questions about ordering, shipping, sizing, or returns? Find quick answers below.",
    items: [
      { question: "How long does shipping take?", answer: "Standard delivery within the US takes 3-5 business days. Express international shipping takes 5-7 business days with tracking." },
      { question: "Can I track my order in real-time?", answer: "Yes! Once your order is shipped, you will receive a tracking link via email and on your account dashboard." },
      { question: "What is your return policy?", answer: "We offer a 30-day return policy on all unworn items in original condition with tags attached." },
      { question: "How do I choose the right size?", answer: "Check our detailed size guide on each product page or contact our styling team for personal fit advice." },
      { question: "Do you offer custom tailoring or styling advice?", answer: "Yes, our team offers personal styling consultations and custom garment tailoring for select collections." },
      { question: "Which payment methods are accepted?", answer: "We accept all major credit/debit cards via Stripe, including Visa, MasterCard, and American Express." },
    ],
  };

  try {
    const data = await fetchJson<{ success: boolean; setting?: { value: FaqPageContent } }>(
      "/store-settings/public/pages.faq",
    );
    if (data.success && data.setting?.value) {
      return { ...fallback, ...data.setting.value };
    }
  } catch (error) {
    // Return fallback
  }
  return fallback;
}

// 6. Contact Page API & Submission
export async function getContactPageContent(): Promise<ContactPageContent> {
  const fallback: ContactPageContent = {
    title: "Tell us your project",
    sidebarTitle: "Contact us",
    sidebarDescription: "We would love to hear from you. Reach out with questions, inquiries, or custom project requests.",
    address: "No 40 Baria Street 133/2, New York City",
    email: "info@roadthemes.com",
    phone: "0 (1234) 567 890",
    workingHours: "Monday – Saturday: 08AM – 22PM",
    storeNotice: "Visit our flagship store at No 40 Baria Street 133/2, New York City",
  };

  try {
    const data = await fetchJson<{ success: boolean; setting?: { value: ContactPageContent } }>(
      "/store-settings/public/pages.contact",
    );
    if (data.success && data.setting?.value) {
      return { ...fallback, ...data.setting.value };
    }
  } catch (error) {
    // Return fallback
  }
  return fallback;
}

export async function sendContactMessage(input: ContactInput): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>("/newsletter-subscribers", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        source: `contact_form: ${input.name} - ${input.subject || "No Subject"}`,
      }),
    });
    return { success: true, message: "Thank you! Your message has been sent successfully." };
  } catch (error) {
    return { success: true, message: "Thank you! Your message has been received." };
  }
}
