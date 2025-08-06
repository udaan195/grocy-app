import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // --- यह नया सेक्शन जोड़ें ---
  server: {
    proxy: {
      // जब भी कोई रिक्वेस्ट '/api' से शुरू हो
      '/api': {
        // तो उसे इस पते पर भेज दो
        target: 'http://localhost:5000',
        // ओरिजिन को बदल दो ताकि CORS की समस्या न आए
        changeOrigin: true,
      }
    }
  }
  // --------------------------
})
