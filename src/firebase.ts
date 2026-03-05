import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { initializeFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASIREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const analytics =
  typeof window !== 'undefined' && firebaseConfig.projectId && firebaseConfig.measurementId
    ? getAnalytics(app)
    : null
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
})
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { analytics, db, auth, provider, signInWithPopup, signOut }
