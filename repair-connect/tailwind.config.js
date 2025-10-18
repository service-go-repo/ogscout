/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
      './*.{js,ts,jsx,tsx}', // Include root level test files
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './models/**/*.{js,ts,jsx,tsx}',
    ],
  safelist: [
    // Dynamic color classes used in models and utilities
    // Status colors
    'text-red-600',
    'text-red-800',
    'text-orange-600',
    'text-orange-800',
    'text-yellow-600',
    'text-yellow-800',
    'text-green-600',
    'text-green-800',
    'text-blue-600',
    'text-blue-800',
    'text-purple-600',
    'text-purple-800',
    'text-gray-600',
    'text-gray-800',
    'bg-red-100',
    'bg-orange-100',
    'bg-yellow-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-purple-100',
    'bg-gray-100',
    'border-red-200',
    'border-orange-200',
    'border-yellow-200',
    'border-green-200',
    'border-blue-200',
    'border-purple-200',
    'border-gray-200',
    // Size classes for rating stars and other dynamic components
    'w-3',
    'h-3',
    'w-4',
    'h-4',
    'w-5',
    'h-5',
    'text-xs',
    'text-sm',
    'text-base',
    // Responsive classes - workaround for Next.js 15 content scanning bug
    // These are auto-extracted from the codebase using extract-responsive-classes.js
    'lg:-mt-16', 'lg:block', 'lg:col-span-2', 'lg:flex-row',
    'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4',
    'lg:h-32', 'lg:h-72', 'lg:hidden', 'lg:items-center',
    'lg:items-end', 'lg:items-start', 'lg:justify-start',
    'lg:min-w-[200px]', 'lg:px-8', 'lg:py-24', 'lg:py-32',
    'lg:text-5xl', 'lg:text-6xl', 'lg:text-left', 'lg:w-32',
    'lg:w-auto', 'md:block', 'md:col-span-2', 'md:flex-row',
    'md:gap-2', 'md:gap-4', 'md:grid-cols-2', 'md:grid-cols-3',
    'md:grid-cols-4', 'md:grid-cols-5', 'md:h-16', 'md:h-32',
    'md:h-64', 'md:justify-end', 'md:p-4', 'md:p-8', 'md:text-4xl',
    'md:text-xl', 'md:w-16', 'md:w-32', 'md:w-64',
    'sm:-mt-14', 'sm:flex', 'sm:flex-none', 'sm:flex-row',
    'sm:gap-3', 'sm:gap-4', 'sm:gap-6', 'sm:grid-cols-2',
    'sm:grid-cols-3', 'sm:h-12', 'sm:h-14', 'sm:h-20', 'sm:h-28',
    'sm:h-4', 'sm:h-56', 'sm:h-7', 'sm:hidden', 'sm:inline',
    'sm:items-center', 'sm:items-end', 'sm:justify-between',
    'sm:mb-3', 'sm:mb-4', 'sm:mb-6', 'sm:mr-2', 'sm:p-12',
    'sm:p-16', 'sm:p-24', 'sm:p-4', 'sm:p-6', 'sm:p-8', 'sm:pb-8',
    'sm:px-6', 'sm:px-8', 'sm:py-3', 'sm:py-10', 'sm:space-x-2',
    'sm:space-x-4', 'sm:space-y-0', 'sm:text-2xl', 'sm:text-3xl',
    'sm:text-4xl', 'sm:text-5xl', 'sm:text-base', 'sm:text-lg',
    'sm:text-sm', 'sm:text-xl', 'sm:w-12', 'sm:w-14', 'sm:w-20',
    'sm:w-28', 'sm:w-4', 'sm:w-7', 'sm:w-80', 'sm:w-[180px]',
    'sm:w-[360px]', 'sm:w-auto', 'sm:max-w-md', 'sm:max-w-4xl',
    'sm:absolute', 'sm:left-auto', 'sm:right-0', 'sm:top-full',
    'sm:mx-0', 'sm:mt-2', 'sm:block', 'sm:flex-initial',
    'sm:flex-wrap', 'sm:items-start', 'sm:justify-end',
    'sm:gap-0', 'sm:self-auto', 'sm:px-0', 'sm:text-right',
    'sm:text-left', 'sm:h-16', 'sm:h-8', 'sm:w-16', 'sm:w-8',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: 'var(--card)',
  			'card-foreground': 'var(--card-foreground)',
  			popover: 'var(--popover)',
  			'popover-foreground': 'var(--popover-foreground)',
  			primary: 'var(--primary)',
  			'primary-foreground': 'var(--primary-foreground)',
  			secondary: 'var(--secondary)',
  			'secondary-foreground': 'var(--secondary-foreground)',
  			muted: 'var(--muted)',
  			'muted-foreground': 'var(--muted-foreground)',
  			accent: 'var(--accent)',
  			'accent-foreground': 'var(--accent-foreground)',
  			destructive: 'var(--destructive)',
  			'destructive-foreground': 'var(--destructive-foreground)',
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			sidebar: 'var(--sidebar)',
  			'sidebar-foreground': 'var(--sidebar-foreground)',
  			'sidebar-primary': 'var(--sidebar-primary)',
  			'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
  			'sidebar-accent': 'var(--sidebar-accent)',
  			'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
  			'sidebar-border': 'var(--sidebar-border)',
  			'sidebar-ring': 'var(--sidebar-ring)'
  		},
  		borderRadius: {
  			lg: 'var(--radius-lg)',
  			md: 'var(--radius-md)',
  			sm: 'var(--radius-sm)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'"Segoe UI"',
  				'Roboto',
  				'Helvetica',
  				'Arial',
  				'sans-serif'
  			],
  			serif: [
  				'var(--font-serif)',
  				'Georgia',
  				'serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'ui-monospace',
  				'Menlo',
  				'Monaco',
  				'monospace'
  			]
  		},
  		boxShadow: {
  			sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  			DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  			md: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  			lg: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  			xl: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  			'2xl': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  			none: 'none'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
}