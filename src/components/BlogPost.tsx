import React from 'react'

type BlogPost = {
    title: string;
    content: string;
    link: string;
    date: string;
    backgroundImage?: string; // Optional background image for each blog post
};

type BlogPageProps = {
    posts: BlogPost[];
};

export default function BlogPage({ posts }: BlogPageProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, index) => (
                <BlogPostCard key={index} {...post} />
            ))}
        </div>
    );
}

type BlogPostCardProps = {
    title: string;
    content: string;
    link: string;
    date: string;
    backgroundImage?: string; // Optional background image for each blog post
};

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
                className="absolute inset-0 transition-colors duration-500 bg-transparent group-hover:bg-special-blue"
            ></div>
            <div className="relative z-10 p-8">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-white">{title}</h2>
                <p className="text-gray-600 mb-4 group-hover:text-white">{date}</p>
                <p className="text-gray-600 mb-4 group-hover:text-white">{content}</p>
                <a href={link} className="text-blue-500 inline-block group-hover:text-yellow-100">
                    Read More
                </a>
            </div>
        </div>
    );
};
