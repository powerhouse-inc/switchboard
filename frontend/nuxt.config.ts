// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Switchboard API',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, height=device-height, minimum-scale=1.0' }
      ]
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@huntersofbook/naive-ui-nuxt',
    '@nuxt/content'
  ],
  typescript: {
    shim: false
  },
  css: [
    'github-markdown-css'
  ],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: '#e88339',
            secondary: '#fae6d8'
          }
        }
      },
      content: []
    }
  },
  naiveUI: {
    themeOverrides: {
      common: {
        primaryColor: '#e88339',
        primaryColorHover: '#fae6d8',
        primaryColorPressed: '#fae6d8'
      }
    }
  }
})
