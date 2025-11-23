// esbuild.config.js
import esbuild from 'esbuild';
import copy from 'esbuild-plugin-copy';

const commonConfig = {
  bundle: true,
  entryPoints: ['src/index.ts'],
};

Promise.all([
  esbuild.build({
    ...commonConfig,
    format: 'esm',
    outfile: 'dist/index.js',
    splitting: false,
    plugins: [
      copy({
        assets: {
          from: ['src/*.css'],
          to: ['.'],
        },
      }),
    ],
  }),
  esbuild.build({
    ...commonConfig,
    format: 'esm',
    minify: true,
    outfile: 'dist/index.min.js',
    splitting: false,
  }),
]).catch(() => process.exit(1));
