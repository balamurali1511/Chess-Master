import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chess: {
					light: 'hsl(var(--chess-light))',
					dark: 'hsl(var(--chess-dark))',
					'board-border': 'hsl(var(--chess-board-border))',
					highlight: 'hsl(var(--chess-highlight))',
					'legal-move': 'hsl(var(--chess-legal-move))',
					'last-move': 'hsl(var(--chess-last-move))',
					check: 'hsl(var(--chess-check))',
					'white-piece': 'hsl(var(--chess-white-piece))',
					'black-piece': 'hsl(var(--chess-black-piece))'
				},
				game: {
					panel: 'hsl(var(--game-panel))',
					'panel-border': 'hsl(var(--game-panel-border))',
					'player-white': 'hsl(var(--player-white))',
					'player-black': 'hsl(var(--player-black))',
					'timer-warning': 'hsl(var(--timer-warning))',
					'timer-danger': 'hsl(var(--timer-danger))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'piece-move': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' },
					'100%': { transform: 'scale(1)' }
				},
				'square-highlight': {
					'0%': { opacity: '0.3' },
					'50%': { opacity: '0.7' },
					'100%': { opacity: '0.5' }
				},
				'capture-effect': {
					'0%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
					'50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.5' },
					'100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' }
				},
				'check-pulse': {
					'0%': { boxShadow: '0 0 0 0 hsl(var(--chess-check) / 0.8)' },
					'70%': { boxShadow: '0 0 0 10px hsl(var(--chess-check) / 0)' },
					'100%': { boxShadow: '0 0 0 0 hsl(var(--chess-check) / 0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'piece-move': 'piece-move 0.3s ease-out',
				'square-highlight': 'square-highlight 1s ease-in-out infinite',
				'capture-effect': 'capture-effect 0.5s ease-out forwards',
				'check-pulse': 'check-pulse 2s infinite'
			},
			backgroundImage: {
				'chess-board': 'var(--gradient-board)',
				'game-panel': 'var(--gradient-panel)'
			},
			boxShadow: {
				'chess-board': 'var(--shadow-board)',
				'chess-piece': 'var(--shadow-piece)',
				'game-panel': 'var(--shadow-panel)'
			},
			transitionProperty: {
				'chess': 'var(--transition-piece)',
				'smooth': 'var(--transition-smooth)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
