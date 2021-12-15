import { defineConfig } from 'vite';

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig( ( { command, node } ) => {
  if ( command === "dev" ) {
    return {
      mode: "development",
      build: {
        sourcemap: true
      }
    }
  } else {
    return {
      mode: 'production',
      build: {
        sourcemap: true
      }
    }
  }
} )