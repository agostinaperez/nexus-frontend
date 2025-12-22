import '@/styles/global.scss'

import { createApp } from 'vue'
//con el pinia puedo compartir datos entre componentes
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

import '@mdi/font/css/materialdesignicons.css' // Importa los iconos de MDI

// el apexcharts es para crear graficos
import VueApexCharts from 'vue3-apexcharts'

// Toast notifications
import 'vue3-toastify-css'
import Toast from 'vue3-toastify'

/**
 * Punto de arranque global de la SPA.
 * - Registra librerías de UI (Vuetify, ApexCharts) y utilidades (Vue Query para datos remotos, Pinia para estado compartido).
 * - Configura el cliente de Vue Query con `staleTime` en 0 para forzar refetch inmediato tras invalidaciones.
 * - Aplica un tema único "nexus" que homogeniza colores y estilos de toda la app.
 * - Inicializa notificaciones Toast y el enrutador antes de montar la aplicación.
 */
const app = createApp(App)

const nexusTheme = {
  dark: true,
  colors: {
    primary: '#48C78E',
    secondary: '#9FB1BF',
    accent: '#9BE8C1',
    background: '#0F171D',
    surface: '#162129',
    'surface-variant': '#1D2A33',
    info: '#8BD5C0',
    success: '#48C78E',
    warning: '#EBCB8B',
    error: '#F08A5D',
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
})

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'nexus',
    themes: {
      nexus: nexusTheme,
    },
  },
})

// Opciones de Toast
const options = {
  position: 'top-right',
  autoClose: 3000, // en vue3-toastify se llama autoClose, NO timeout
  hideProgressBar: false,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  draggable: true,
}
app.use(VueQueryPlugin, { queryClient })
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueApexCharts)
app.use(Toast, options)
app.mount('#app')
