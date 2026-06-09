module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],

  corePlugins: {
    ringColor: false,
    ringWidth: false,
    ringOpacity: false,
    ringOffsetWidth: false,
    ringOffsetColor: false
  },

  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
};
