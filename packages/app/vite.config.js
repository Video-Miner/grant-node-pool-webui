import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(),tailwindcss(),],
    server: {
        allowedHosts: ['localhost','.pages.dev','.open-pool.com'],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    recharts: ['recharts'],
                    lucide: ['lucide-react']
                },
            },
        },
    }
})
