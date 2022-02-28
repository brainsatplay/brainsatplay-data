
import { dtsPlugin } from 'esbuild-plugin-d.ts'
//import globalExternals from '@fal-works/esbuild-plugin-global-externals'

import esbuild from 'esbuild'

console.time('es');
console.log('esbuild starting!')

const entryPoints = ['src/index.ts'];
const outfile = 'dist/index';

esbuild.build({ //commonjs
  entryPoints,
  bundle:true,
  outfile:outfile+'.js',
  format:'cjs'
});

esbuild.build({ //esmodules
  entryPoints,
  bundle:true,
  outfile:outfile+'.esm.js',
  format:'esm',
  minify:true
});

esbuild.build({ //generates types correctly
  entryPoints,
  bundle:true,
  outfile:outfile+'.iife.js',
  format:'iife',
  minify:true,
  plugins:[ 
    dtsPlugin() 
  ]
});

console.log('esbuild completed!')
console.timeEnd('es');