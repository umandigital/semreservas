#!/usr/bin/env node
// Gera a imagem de capa de um modelo 3D: render com FUNDO TRANSPARENTE (webp com alfa), para o cardápio mostrar
// enquanto o 3D carrega, sem "pulo" de fundo. Uso:
//   node tools/modelos/gerar-poster.cjs <modelo.glb> <saida.webp> ["35deg 68deg auto"]
// Precisa de: playwright (chromium) e python3 com Pillow. Usa o <model-viewer> instalado em apps/consumidor.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process')
const [glb, saida, orbita = '30deg 66deg auto'] = process.argv.slice(2)
if (!glb || !saida) { console.error('uso: gerar-poster.cjs <modelo.glb> <saida.webp> [orbita]'); process.exit(1) }
const mv = path.resolve(__dirname, '../../apps/consumidor/node_modules/@google/model-viewer/dist/model-viewer.min.js')
const pagina = `<!doctype html><meta charset=utf-8><body style="margin:0;background:transparent"><script type=module src=/mv.js></script>
<model-viewer id=m src=/m.glb camera-orbit="${orbita}" field-of-view="30deg" shadow-intensity="1" shadow-softness=".9" exposure="1.05" environment-image="neutral" style="width:1100px;height:1100px;--poster-color:transparent;background:transparent"></model-viewer>`
const srv = http.createServer((q, r) => {
  const f = q.url === '/mv.js' ? [mv, 'text/javascript'] : q.url === '/m.glb' ? [path.resolve(glb), 'model/gltf-binary'] : null
  if (f) { r.writeHead(200, { 'content-type': f[1] }); fs.createReadStream(f[0]).pipe(r) } else { r.writeHead(200, { 'content-type': 'text/html' }); r.end(pagina) }
}).listen(0, async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
  const p = await b.newPage({ viewport: { width: 1100, height: 1100 } }); await p.goto(`http://localhost:${srv.address().port}/`)
  await p.waitForFunction(() => { const m = document.getElementById('m'); return m && m.loaded }, null, { timeout: 90000 }); await p.waitForTimeout(1200)
  const b64 = await p.evaluate(async () => { const m = document.getElementById('m'); const blob = await m.toBlob({ mimeType: 'image/png', idealAspect: false }); const u = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s) })
  const dim = await p.evaluate(() => { const d = document.getElementById('m').getDimensions(); return [d.x, d.y, d.z].map(v => +v.toFixed(3)) })
  await b.close(); srv.close()
  const png = saida.replace(/\.webp$/, '') + '.tmp.png'; fs.writeFileSync(png, Buffer.from(b64, 'base64'))
  const py = `from PIL import Image\nim=Image.open(${JSON.stringify(png)}).convert('RGBA'); bb=im.getbbox(); im=im.crop(bb) if bb else im\nim.save(${JSON.stringify(saida)},'WEBP',quality=88,method=6); print(im.size)`
  const r = spawnSync('python3', ['-I', '-c', py], { encoding: 'utf8' }); fs.unlinkSync(png)
  console.log('dimensões do modelo (m):', dim.join(' × '), '| poster', saida, r.stdout.trim(), fs.statSync(saida).size, 'bytes')
})
