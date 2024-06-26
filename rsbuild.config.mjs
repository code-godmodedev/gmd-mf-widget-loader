import { defineConfig } from '@rsbuild/core';
// import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';

export default defineConfig({
  output: {
    filename: {
      js: '[name].js',
    },
    distPath: {
      js: '',
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
  // plugins: [pluginReact()],
  plugins: [
    pluginBabel({
      babelLoaderOptions: (config) => {
        // Add a Babel plugin
        // note: the plugin have been added to the default config to support antd load on demand
        config.presets ||= [];
        config.presets.push([
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ]);
      },
    }),
  ],
});
