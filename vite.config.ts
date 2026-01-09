import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We use '.' instead of process.cwd() to avoid TS2580 error if @types/node is missing
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Vital: Map process.env.API_KEY in the code to the VITE_API_KEY environment variable
      // This ensures the key you set in Vercel is accessible to the @google/genai SDK
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
