/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{css,xml,html,vue,svelte,ts,tsx}'],
  // use the .ns-dark class to control dark mode (applied by NativeScript) - since 'media' (default) is not supported.
  // NOTE: There is a problem that nativescript adds .ns-dark when the system theme is dark and ignores forceDarkAllowed
  // so we use our own class to manage dark mode.
  darkMode: ['class', '.app-dark'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // disables browser-specific resets
  },
}
