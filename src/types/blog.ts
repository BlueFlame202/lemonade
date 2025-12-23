export const categories = [
  "math",
  "geometry",
  "probability",
  "ml",
  "cs",
  "philosophy",
  "music",
  "life",
  "plants",
  "science",
  "tea",
  "nt",
  "artistic",
] as const;

export type Category = typeof categories[number];

export type BlogPost = {
    title: string;
    content: string;
    link: string;
    date: string;
    backgroundImage?: string; // Optional background image for each blog post
    category: Category[];
};

export type BlogPageProps = {
    posts: BlogPost[];
    postsPerPage?: number;
};

export type BlogPostCardProps = {
    title: string;
    content: string;
    link: string;
    date: string;
    backgroundImage?: string; // Optional background image for each blog post
};