// auth.config.ts
import Google from "@auth/core/providers/google"
import { defineConfig } from 'auth-astro'

export default defineConfig({
    providers: [
        Google({
            clientId: import.meta.env.GOOGLE_ID,
            clientSecret: import.meta.env.GOOGLE_SECRET
        })
    ],
    prefix: '/api/auth',
})

