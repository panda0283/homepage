import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/entry.tsx'
    }
  },
  html: {
    template: './public/index.html'
  },
  output: {
    distPath: {
      root: 'build'
    }
  },
  server: {
    port: 3000
  }
});