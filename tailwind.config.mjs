/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
		  keyframes: {
			quarterrotate: {
			  '0%': { transform: 'rotate(0deg)' },
			  '100%': { transform: 'rotate(45deg)' },
			}
		  },
		  animation: {
			quarterrotate: 'quarterrotate 0.5s linear forwards;',
		  },
		  colors: {
			'special-color': 'rgba(var(--accent-rgb), 1)', //'#8a9a5b', // '#590016', //'#489fdd', // '#56b9ff',
			'special-color-darker': 'rgba(var(--accent-darker-rgb), 1)', // '#7e7e5a', //'#590016', // '#3577a6',
			'solved-blue': '#aeecff',
			'solved-blue-darker': '#abddf6',
			'header-image-bg': '#ffeed9',
			'header-image-bg-light': '#fffff6',
			'primary': 'rgba(var(--primary-rgb), 1)',
			'secondary': 'rgba(var(--secondary-rgb), 1)',
			'tertiary': 'rgba(var(--tertiary-rgb), 1)',
			'quaternary': 'rgba(var(--quaternary-rgb), 1)',
			'soul': 'rgba(var(--soul-rgb), 1)',
		  },
		  // backgroundImage: {
		  //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
		  //   'gradient-conic':
		  //     'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
		  // },
		},
	  },
	plugins: [],
}
