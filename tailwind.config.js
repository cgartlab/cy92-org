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
					dark: 'hsl(var(--primary-dark) / <alpha-value>)',
					light: 'hsl(var(--primary-light) / <alpha-value>)',
					subtle: 'hsl(var(--primary-subtle) / 0.08)',
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
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
				'3xl': '1.5rem'
			},
			fontFamily: {
				sans: ['Inter', 'Noto Sans SC', ...fontFamily.sans],
				display: ['Inter', 'Noto Sans SC', ...fontFamily.sans],
				serif: ['Source Serif 4', 'Noto Serif SC', 'Georgia', 'Times New Roman', 'serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace']
			},
			animation: {
				'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'float': 'float 6s ease-in-out infinite',
				'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
			},
			keyframes: {
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUp: {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				scaleIn: {
					from: { opacity: '0', transform: 'scale(0.9)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				fadeInUp: {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				reveal: {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				}
			},
			boxShadow: {
				'glow': '0 0 40px rgba(212, 165, 116, 0.15)',
				'glow-lg': '0 0 60px rgba(212, 165, 116, 0.2)',
			},
			transitionTimingFunction: {
				'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': theme('colors.stone.700'),
						'--tw-prose-headings': theme('colors.stone.900'),
						'--tw-prose-lead': theme('colors.stone.600'),
						'--tw-prose-links': theme('colors.amber.700'),
						'--tw-prose-bold': theme('colors.stone.900'),
						'--tw-prose-counters': theme('colors.stone.500'),
						'--tw-prose-bullets': theme('colors.stone.300'),
						'--tw-prose-hr': theme('colors.stone.200'),
						'--tw-prose-quotes': theme('colors.stone.900'),
						'--tw-prose-quote-borders': theme('colors.amber.600'),
						'--tw-prose-captions': theme('colors.stone.500'),
						'--tw-prose-code': theme('colors.stone.900'),
						'--tw-prose-pre-code': theme('colors.stone.200'),
						'--tw-prose-pre-bg': 'rgb(var(--gray-dark) / 1)',
						'--tw-prose-th-borders': theme('colors.stone.300'),
						'--tw-prose-td-borders': theme('colors.stone.200'),
						'--tw-prose-invert-body': theme('colors.stone.300'),
						'--tw-prose-invert-headings': theme('colors.white'),
						'--tw-prose-invert-lead': theme('colors.stone.400'),
						'--tw-prose-invert-links': theme('colors.amber.400'),
						'--tw-prose-invert-bold': theme('colors.white'),
						'--tw-prose-invert-counters': theme('colors.stone.400'),
						'--tw-prose-invert-bullets': theme('colors.stone.600'),
						'--tw-prose-invert-hr': theme('colors.stone.700'),
						'--tw-prose-invert-quotes': theme('colors.stone.100'),
						'--tw-prose-invert-quote-borders': theme('colors.amber.500'),
						'--tw-prose-invert-captions': theme('colors.stone.400'),
						'--tw-prose-invert-code': theme('colors.white'),
						'--tw-prose-invert-pre-code': theme('colors.stone.300'),
						'--tw-prose-invert-pre-bg': 'rgb(var(--gray-dark) / 1)',
						'--tw-prose-invert-th-borders': theme('colors.stone.600'),
						'--tw-prose-invert-td-borders': theme('colors.stone.700'),
					},
				},
			}),
		}
	}
}

export default config
