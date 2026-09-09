import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	safelist: ['dark'],
	plugins: [require('@tailwindcss/typography')],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--ds-radius-lg)',
				md: 'var(--ds-radius-md)',
				sm: 'var(--ds-radius-sm)',
				xl: 'var(--ds-radius-xl)',
				'2xl': 'var(--ds-radius-2xl)',
			},
			fontFamily: {
				sans: ['Inter', 'Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
				display: ['Inter', 'Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
				body: ['Inter', 'Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'IBM Plex Mono', 'SF Mono', 'ui-monospace', 'monospace']
			},
			animation: {
				'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
				'float': 'float 6s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUp: {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				scaleIn: {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
			},
			transitionTimingFunction: {
				'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': '#6B6560',
						'--tw-prose-headings': '#111111',
						'--tw-prose-lead': '#9E978C',
						'--tw-prose-links': '#8A8C6E',
						'--tw-prose-bold': '#111111',
						'--tw-prose-counters': '#9E978C',
						'--tw-prose-bullets': '#C5C0B7',
						'--tw-prose-hr': '#E8E6E1',
						'--tw-prose-quotes': '#2D2926',
						'--tw-prose-quote-borders': '#8A8C6E',
						'--tw-prose-captions': '#9E978C',
						'--tw-prose-code': '#111111',
						'--tw-prose-pre-code': '#D4D2CC',
						'--tw-prose-pre-bg': '#111111',
						'--tw-prose-th-borders': '#C5C0B7',
						'--tw-prose-td-borders': '#E8E6E1',
						'--tw-prose-invert-body': '#A0A098',
						'--tw-prose-invert-headings': '#FAF9F6',
						'--tw-prose-invert-lead': '#888880',
						'--tw-prose-invert-links': '#A0A288',
						'--tw-prose-invert-bold': '#FAF9F6',
						'--tw-prose-invert-counters': '#888880',
						'--tw-prose-invert-bullets': '#444444',
						'--tw-prose-invert-hr': '#333333',
						'--tw-prose-invert-quotes': '#D4D2CC',
						'--tw-prose-invert-quote-borders': '#A0A288',
						'--tw-prose-invert-captions': '#888880',
						'--tw-prose-invert-code': '#FAF9F6',
						'--tw-prose-invert-pre-code': '#A0A098',
						'--tw-prose-invert-pre-bg': '#1A1A1A',
						'--tw-prose-invert-th-borders': '#444444',
						'--tw-prose-invert-td-borders': '#333333',
					},
				},
			}),
		}
	}
}

export default config
