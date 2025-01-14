/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#7CCDB0', // Primary
          dark: '#5BB799',    // Hover/Active
          light: '#99DDBE',   // Secondary/Highlights
        },
        orange: {
          DEFAULT: '#FF5733', // Primary
          dark: '#E64A2E',    // Hover
          light: '#FF795C',   // Secondary
        },
        text: {
          header: '#333333',  // Headers
          body: '#666666',    // Body text
          subtle: '#999999',  // Secondary text
        },
        bg: {
          gray: '#EEEEEE',    // Alt backgrounds
        },
        system: {
          link: '#337AB7',    // Interactive
          success: '#5CB85C', // Confirmation
          error: '#D9534F',   // Errors/Alerts
        }
      },
      // Add button styles as components
      buttons: {
        primary: {
          base: 'bg-orange text-white hover:bg-orange-dark transition-colors',
          ghost: 'border-2 border-orange text-orange hover:bg-orange-light hover:text-white transition-colors',
        },
        secondary: {
          base: 'bg-mint text-white hover:bg-mint-dark transition-colors',
        }
      }
    }
  },
  plugins: [],
} 