// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      projectId: import.meta.env.WALLETCONNECT_PROJECT_ID?.toString() ?? "",
      backendUrl: import.meta.env.BACKEND_URL?.toString() ?? ""
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true
    }
  },
  css: ['~/assets/css/main.css', 'vuetify/lib/styles/main.sass', '@mdi/font/css/materialdesignicons.min.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  ssr: true,
  telemetry: false,
  app: {
    head: {
      title: "ElonWallet",
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/favicon.png' }
      ]
    }
  },
})
