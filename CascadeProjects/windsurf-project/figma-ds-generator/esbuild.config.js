const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const watch = process.argv.includes('--watch');

// Copy HTML template to dist
fs.copyFileSync(
  path.join(__dirname, 'src/ui.html'),
  path.join(__dirname, 'dist/ui.html')
);

const buildOptions = {
  entryPoints: {
    'code': 'src/code.ts',
    'ui': 'src/ui.tsx'
  },
  bundle: true,
  outdir: 'dist',
  target: 'es6',
  format: 'iife',
  loader: { '.tsx': 'tsx', '.json': 'json' },
  minify: !watch,
  sourcemap: watch,
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  external: ['react', 'react-dom'],
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'window'
  },
  globalName: 'ui'
};

(async () => {
  try {
    if (watch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('Watching...');
    } else {
      await esbuild.build(buildOptions);
      console.log('Build complete');
    }
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
})();
