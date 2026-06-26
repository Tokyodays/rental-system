// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],
  supabase: {
    redirect: false
  },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'development'
    }
  }
})
