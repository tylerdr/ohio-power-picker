import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_AUTHOR } from '@/lib/site';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  content: string;
  readingTime: number;
};

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog');

const parseFrontmatter = (source: string) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return {
      frontmatter: {} as Record<string, string>,
      content: source.trim(),
    };
  }

  const frontmatterBlock = match[1];
  const frontmatter = frontmatterBlock
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return acc;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, '');
      acc[key] = value;
      return acc;
    }, {});

  return {
    frontmatter,
    content: source.slice(match[0].length).trim(),
  };
};

const estimateReadingTime = (content: string) => {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.ceil(words / 220));
};

const readPostFromFile = (fileName: string): BlogPost => {
  const fullPath = path.join(BLOG_DIRECTORY, fileName);
  const source = fs.readFileSync(fullPath, 'utf8');
  const { frontmatter, content } = parseFrontmatter(source);
  const slug = fileName.replace(/\.md$/, '');

  return {
    slug,
    title: frontmatter.title ?? slug,
    description: frontmatter.description ?? 'Ohio electricity insights and rate comparison guidance.',
    date: frontmatter.date ?? '2026-01-01',
    author: frontmatter.author ?? DEFAULT_AUTHOR,
    content,
    readingTime: estimateReadingTime(content),
  };
};

const loadPosts = (): BlogPost[] => {
  if (!fs.existsSync(BLOG_DIRECTORY)) return [];

  return fs
    .readdirSync(BLOG_DIRECTORY)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => readPostFromFile(fileName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const blogPosts = loadPosts();

export const blogSlugs = blogPosts.map((post) => post.slug);

export const getBlogPost = (slug: string) =>
  blogPosts.find((post) => post.slug === slug);
