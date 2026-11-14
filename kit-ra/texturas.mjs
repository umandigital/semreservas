// Reduz texturas acima de N px (padrão 2048) de um .glb, recomprimindo em JPEG. Uso: node texturas.mjs entrada.glb saida.glb [max=2048]
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { spawnSync } from 'node:child_process'; import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs'; import { tmpdir } from 'node:os'; import { join } from 'node:path'
const [ent, sai, max = '2048'] = process.argv.slice(2)
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const d = await io.read(ent); const dir = mkdtempSync(join(tmpdir(), 'tx-'))
let i = 0
for (const t of d.getRoot().listTextures()) {
  const [w, h] = t.getSize() ?? [0, 0]; if (Math.max(w, h) <= +max) continue
  const a = join(dir, `${i}.in`), b = join(dir, `${i}.jpg`); writeFileSync(a, t.getImage()); i++
  const r = spawnSync('python3', ['-I', '-c', `from PIL import Image;im=Image.open('${a}').convert('RGB');im.thumbnail((${max},${max}),Image.LANCZOS);im.save('${b}','JPEG',quality=85,optimize=True)`])
  if (r.status) throw new Error(String(r.stderr)); t.setImage(new Uint8Array(readFileSync(b))).setMimeType('image/jpeg'); console.log(`textura ${w}x${h} -> máx ${max}`)
}
await io.write(sai, d)
