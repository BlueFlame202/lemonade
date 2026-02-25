import React from 'react'
import { useState } from "react";
import type { Category, BlogPageProps, BlogPostCardProps } from "../types/blog"
import { categories } from "../types/blog"

function getPageNumbers(current: number, total: number, maxVisible = 7) {
  const pages: (number | "...")[] = [];

  const halfVisible = Math.floor(maxVisible / 2);
  let left = current - halfVisible; // what is the leftmost number visible after ...
  let right = current + halfVisible; // what is the rightmost nusmber visible before ...
  // right - left + 1 = 2 * halfVisible + 1
  
  if (left < 1) { // it is impossible to have this many items to the left
    right += (-left + 1); // adjust to have more items on the right
    left = 1; // just include all numbers
    // right - left + 1 changes by 0
  }
  if (right > total) { // it is impossible to have this many items to the right
    left -= (right - total); // adjust to have more items on the left
    right = total; // just include all numbers
    // right - left + 1 changes by 0
  }
  if (left < 1) { // we can fit everything
    left = 1;
    // right - left + 1 changes, but its at most getting smaller; maxVisible can fit everything.
  }

  if (left > 1) {
    left += 2; // make room for 1 and ...
    pages.push(1);
    pages.push("...");
  }
  for (let i = left; i <= current; i++) pages.push(i);

  if (right < total) {
    right -= 2; // make room for ... and total
    for (let i = current+1; i <= right; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else {
    for (let i = current+1; i <= right; i++) pages.push(i);
  }
  return pages
}

export default function BlogPage({ posts, postsPerPage = 9 }: BlogPageProps) {
  const [selected, setSelected] = useState<Set<Category>>(
    new Set([]) // default selection (optional)
  );

  const toggleCategory = (cat: Category) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filteredPosts =
    selected.size === 0
      ? posts
      : posts.filter(post =>
          post.category.some(c => selected.has(c))
        );

  const [page, setPage] = useState(1);

  // Compute total pages
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Slice posts for the current page
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  return (
    <>
      {/* Category Toggles */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map(cat => {
          const active = selected.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded-full border transition
                ${active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 gap-2 flex-wrap">
        <button
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>

        {getPageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={`${p}-${i}`}
              onClick={() => setPage(p as number)}
              className={`px-3 py-1 border rounded ${
                page === p ? "bg-blue-600 text-white border-blue-600" : ""
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <br/>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPosts.map(post => (
          <BlogPostCard key={post.link} {...post} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 gap-2 flex-wrap">
        <button
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>

        {getPageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`${p}-${i}`} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p as number)}
              className={`px-3 py-1 border rounded ${
                page === p ? "bg-blue-600 text-white border-blue-600" : ""
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ title, content, link, date, backgroundImage }) => {
    return (
        <div 
            className="relative group rounded-lg shadow-lg overflow-hidden"
            style={{ backgroundColor: backgroundImage ? 'transparent' : 'white' }}
        >
            {backgroundImage && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-15 blur-none"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                ></div>
            )}
            <div 
                className="absolute inset-0 transition-colors duration-500 bg-transparent group-hover:bg-special-color"
            ></div>
            <div className="relative z-10 p-8">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-white">{title}</h2>
                <p className="text-gray-600 mb-4 group-hover:text-white">{date}</p>
                <p className="text-gray-600 mb-4 group-hover:text-white">{content}</p>
                <a href={link} className="inline-block group-hover:text-yellow-100">
                    Read More
                </a>
            </div>
        </div>
    );
};
