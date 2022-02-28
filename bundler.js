
import { dtsPlugin } from 'esbuild-plugin-d.ts'
//import globalExternals from '@fal-works/esbuild-plugin-global-externals'

import esbuild from 'esbuild'

esbuild.build({
  entryPoints:['src/index.ts'],
  bundle:true,
  outfile:'dist/index.js',
  format:'cjs',
  plugins:[ 
    dtsPlugin() 
  ]
})

esbuild.build({
  entryPoints:['src/index.ts'],
  bundle:true,
  outfile:'dist/index.esm.js',
  format:'iife',
  minify:true,
  plugins:[ 
  dtsPlugin() 
]
})