import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/styles.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Fail fast if required env is missing rather than silently hitting the frontend
// origin with every API call.
if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.development.example to .env.development ' +
      '(or configure your deployment) and set VITE_API_BASE_URL before starting the app.',
  )
}

const app = createApp(App)
app.use(router)
app.mount('#app')
