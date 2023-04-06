const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? ''

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
  runtimeConfig: {
    public: {
      GQL_HOST: `${BACKEND_ORIGIN}/api/graphql`
    }
  },
  modules: [
    '@huntersofbook/naive-ui-nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-graphql-client'
  ],
  typescript: {
    shim: false
  },
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
        primaryColorHover: '#f45d2f',
        primaryColorPressed: '#fae6d8'
      }
    }
  }
})
