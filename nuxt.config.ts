// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    ssr: false,
  nitro: {
    preset: 'static'
  },

  runtimeConfig: {
    public: {
      // api: 'https://api.ctsantaisabel.com',
      api: 'http://127.0.0.1:8000',
      login: 'api/v1/login',
      eps: 'api/v1/eps',
      professions: 'api/v1/professions',
      empresas: 'api/v1/empresas',
      users: 'api/v1/users',
      pacientes: 'api/v1/pacientes',
      profesionals: 'api/v1/profesionals',
      informacionUsers: 'api/v1/informacionUsers',
      citas: 'api/v1/citas',
      historiasClinicas: 'api/v1/historiasClinicas',
      analisis: 'api/v1/analisis',
      examenFisicos: 'api/v1/examenFisicos',
      planManejoMedicamentos: 'api/v1/planManejoMedicamentos',
      planManejoProcedimientos: 'api/v1/planManejoProcedimientos',
      planManejoEquipos: 'api/v1/planManejoEquipos',
      planManejoInsumos: 'api/v1/planManejoInsumos',
      antecedentes: 'api/v1/antecedentes',
      diagnosticos: 'api/v1/diagnosticos',
      notas: 'api/v1/notas',
      software: 'api/v1/software',
      facturaciones: 'api/v1/facturaciones',
      enfermedades: 'api/v1/enfermedades',
      secciones: 'api/v1/secciones',
      cambiarContraseña: 'api/v1/cambiarContraseña',
      recuperarContraseña: 'api/v1/recuperarContraseña',
      primerIngreso: 'api/v1/primerIngreso',
      diasAsignadosRestantes: 'api/v1/diasAsignadosRestantes',
    }
  },
  app: {
    head: {
      script: [
        {
          async: true,
          src: "https://unpkg.com/@material-tailwind/html/scripts/ripple.js",
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
  ],
  colorMode: {
    classSuffix: '',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },
});





