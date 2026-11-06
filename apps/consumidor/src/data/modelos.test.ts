import { readFileSync, statSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ITENS } from './cardapio'

// Confere cada modelo 3D do cardápio contra o que o restaurante declarou: tamanho REAL, base no chão, centrado, peso.
// É isto que faz a realidade aumentada projetar "já direito": tamanho e posição são propriedades do arquivo.
const arquivo = (rel: string) => new URL('../../public/' + rel, import.meta.url)
function glb(rel: string) {
  const b = readFileSync(arquivo(rel)); if (b.toString('utf8', 0, 4) !== 'glTF') throw new Error('não é um .glb: ' + rel)
  let off = 12, json: any = null
  while (off < b.length) { const len = b.readUInt32LE(off), tipo = b.toString('utf8', off + 4, off + 8); if (tipo === 'JSON') json = JSON.parse(b.toString('utf8', off + 8, off + 8 + len)); off += 8 + len }
  return json
}
function caixa(j: any) {
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]
  for (const n of j.nodes ?? []) if (n.matrix || n.rotation || (n.scale && n.scale.some((v: number) => v !== 1)) || (n.translation && n.translation.some((v: number) => v !== 0))) throw new Error('nó com transformação: normalize o modelo antes (origem no centro da base, escala em metros)')
  for (const m of j.meshes) for (const p of m.primitives) { const a = j.accessors[p.attributes.POSITION]; for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], a.min[k]); mx[k] = Math.max(mx[k], a.max[k]) } }
  return { dim: [0, 1, 2].map(k => mx[k] - mn[k]), centro: [(mn[0] + mx[0]) / 2, (mn[2] + mx[2]) / 2], base: mn[1] }
}

const com3d = ITENS.filter(i => i.modelo)
describe('modelos 3D do cardápio', () => {
  it('há pelo menos um prato em 3D', () => expect(com3d.length).toBeGreaterThan(0))
  for (const i of com3d) describe(i.nome, () => {
    const m = i.modelo!
    it('arquivos existem (modelo e capa)', () => { expect(existsSync(arquivo(m.glb))).toBe(true); expect(existsSync(arquivo(m.poster))).toBe(true) })
    it('peso até 6 MB (4G de restaurante)', () => expect(statSync(arquivo(m.glb)).size).toBeLessThanOrEqual(6 * 1024 * 1024))
    it('não exige extensão que o Scene Viewer / Quick Look ignorariam', () => expect(glb(m.glb).extensionsRequired ?? []).toEqual([]))
    it('tamanho real confere com o declarado (±3%)', () => { const c = caixa(glb(m.glb)); m.tamanhoM.forEach((v, k) => expect(Math.abs(c.dim[k] - v) / v, `eixo ${k}: arquivo ${c.dim[k].toFixed(4)} m, declarado ${v} m`).toBeLessThan(0.03)) })
    it('base no chão (y = 0) e centrado, para assentar na mesa onde se aponta', () => { const c = caixa(glb(m.glb)); expect(Math.abs(c.base)).toBeLessThan(0.005); expect(Math.abs(c.centro[0])).toBeLessThan(0.02); expect(Math.abs(c.centro[1])).toBeLessThan(0.02) })
    it('unidade plausível para um prato (entre 5 cm e 60 cm)', () => { const c = caixa(glb(m.glb)); expect(Math.max(...c.dim)).toBeGreaterThan(0.05); expect(Math.max(...c.dim)).toBeLessThan(0.6) })
  })
})
