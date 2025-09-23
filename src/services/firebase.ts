import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Mejora de conectividad para entornos con proxy o restricciones de red
// - experimentalAutoDetectLongPolling intenta detectar cuando es necesario long-polling
// - experimentalForceLongPolling fuerza long-polling si lo prefieres; aquí dejamos auto-detección
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  // useFetchStreams puede causar problemas con algunos proxies
  useFetchStreams: false,
} as any)

// Inicializar Analytics solo en producción para evitar errores locales por proxy/bloqueos
export const analyticsPromise = import.meta.env.PROD
  ? analyticsIsSupported().then((ok) => (ok ? getAnalytics(app) : null)).catch(() => null)
  : Promise.resolve(null)


