/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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
  				'Segoe UI"',
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