/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  // Preflight désactivé pendant la migration progressive : il réinitialise les styles
  // de base (titres, boutons…) des pages qui utilisent encore des styles inline.
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {}
  },
  plugins: []
};
