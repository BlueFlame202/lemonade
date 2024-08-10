'use client'
import { useState } from 'react'

type NavbarProps = {
    active: string; // You can adjust the type as needed
};

export default function Navbar(props : NavbarProps) {

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white p-4">
    <div id="banner" className="flex justify-center md:justify-start">
      <img src="/img/AK-circle.png" className="logo" alt="lemonade"></img>
        <div>
          <h1 className="hidden md:block">Lemonade</h1>
          <h2 className="hidden md:block">A Sweet Homemade Drink Made in Many Parts of the World</h2>
        </div>
      </div>
    {/* <img src="/img/lemonade-header.png" alt="logo" id="banner" className="w-full" width={500} layout="responsive" /> */}
    <br />
    <div className="flex justify-end md:hidden">
    <button className="flex items-center justify-center focus:outline-none" onClick={toggleDropdown}>
    {/* ref={torotateRef} */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
        </button>
    </div>
    <div className={`group shadow-md relative z-10 flex items-center w-full bg-white transition-colors duration-500 no-underline hover:bg-special-blue ${isOpen ? 'block' : 'hidden'} md:flex md:items-center md:justify-around`} style={{ maxHeight: '5%' }}>
        <div className="text-base my-4 flex flex-col md:flex-row justify-around w-full" id="links">
          <a href="/" className={`p-2 relative flex items-center no-underline overflow-hidden expanding-underline text-special-blue group-hover:text-white group-hover:no-underline ${props.active === 'home' ? 'active' : ''}`}>
            Home
          </a>
          <a href="/blog" className={`p-2 relative flex items-center no-underline overflow-hidden expanding-underline text-special-blue group-hover:text-white group-hover:no-underline ${props.active === 'blog' ? 'active' : ''}`}>
            Blog
          </a>
          <a href="/notes" className={`p-2 relative flex items-center no-underline overflow-hidden expanding-underline text-special-blue group-hover:text-white group-hover:no-underline ${props.active === 'notes' ? 'active' : ''}`}>
            Notes
          </a>
          <a href="/projects" className={`p-2 relative flex items-center no-underline overflow-hidden expanding-underline text-special-blue group-hover:text-white group-hover:no-underline ${props.active === 'projects' ? 'active' : ''}`}>
            Projects
          </a>
          <a href="/sea" className={`p-2 relative flex items-center no-underline overflow-hidden expanding-underline text-special-blue group-hover:text-white group-hover:no-underline ${props.active === 'sea' ? 'active' : ''}`}>
            🌊
          </a>
          <a href="https://www.ocf.berkeley.edu/~aathreyak/orange-juice" className={`p-2 relative flex items-center no-underline overflow-hidden expanding-underline text-special-blue group-hover:text-white group-hover:no-underline ${props.active === 'orange-juice' ? 'active' : ''}`}>
            🧃
            {/* <img src="/img/juice-5397880_1920.png" alt="orange-juice" id="orange-juice" width={50} height={50} /> */}
          </a>
        </div>
      </div>
    </div>
  );
}
