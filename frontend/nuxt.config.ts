const API_ORIGIN = process.env.API_ORIGIN ?? '/backend'

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
      GQL_PLAYGROUND: `${API_ORIGIN}/`
    }
  },
  modules: [
    '@huntersofbook/naive-ui-nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    'nuxt-graphql-client'
  ],
  typescript: {
    shim: false
  },
  css: [
    'github-markdown-css/github-markdown-light.css'
  ],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: '#e88339',
            primaryHover: '#f45d2f',
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
  },
  'graphql-client': {
    clients: {
      default: {
        host: `${API_ORIGIN}/graphql`,
        schema: '../api/src/generated/schema.graphql'
      }
    }
  }
})
