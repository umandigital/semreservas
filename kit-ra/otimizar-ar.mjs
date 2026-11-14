#!/usr/bin/env node
// Gera a versão LEVE de um modelo 3D para a realidade aumentada: menos triângulos, mesma aparência e MESMO tamanho real.
// O modelo completo continua sendo usado no cardápio e no Scene Viewer; só a RA do navegador usa este (precisa de 60 quadros por segundo).
//   node otimizar-ar.mjs <entrada.glb> <saida.glb> [triangulos-alvo=50000] [erro=0.01]
// Só simplifica a malha (sem Draco/Meshopt no arquivo), então abre em qualquer visor. Não mexe em escala, origem nem materiais.
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { weld, simplify, prune, dedup } from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'

const [entrada, saida, alvoTri = '50000', erro = '0.01'] = process.argv.slice(2)
if (!entrada || !saida) { console.error('uso: otimizar-ar.mjs <entrada.glb> <saida.glb> [triangulos-alvo] [erro]'); process.exit(1) }
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const doc = await io.read(entrada)
const tris = d => d.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().reduce((k, p) => k + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0), 0)
const caixa = d => { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const m of d.getRoot().listMeshes()) for (const p of m.listPrimitives()) { const a = p.getAttribute('POSITION'); for (let i = 0; i < a.getCount(); i++) { const v = a.getElement(i, []); for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], v[k]); mx[k] = Math.max(mx[k], v[k]) } } } return mx.map((v, k) => +(v - mn[k]).toFixed(4)) }
const antes = tris(doc), caixaAntes = caixa(doc)
await MeshoptSimplifier.ready
const ratio = Math.min(1, Number(alvoTri) / antes)
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio, error: Number(erro), lockBorder: false }), dedup(), prune())
await io.write(saida, doc)
const depois = tris(doc), caixaDepois = caixa(doc)
const dif = caixaAntes.map((v, k) => Math.abs(v - caixaDepois[k]) / v)
console.log(`triângulos: ${antes} → ${depois} (${(100 * depois / antes).toFixed(0)}%) | tamanho real antes ${caixaAntes.join('×')} m, depois ${caixaDepois.join('×')} m`)
if (Math.max(...dif) > 0.02) { console.error('AVISO: o tamanho mudou mais de 2%: aumente o alvo ou reduza o erro'); process.exit(2) }
