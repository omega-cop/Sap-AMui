import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Vital: Map process.env.API_KEY in the code to the VITE_API_KEY environment variable
      // This ensures the key you set in Vercel is accessible to the @google/genai SDK
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
