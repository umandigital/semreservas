// RA própria (WebXR) para Android/Chrome. Regras que garantem estabilidade e fluidez:
//  1. o prato NÃO segue a câmera: espera uma superfície horizontal ESTÁVEL no centro da tela, aparece ali em tamanho real e
//     fica TRAVADO no mundo (âncora do ARCore quando existe; senão posição fixa). Mexer o celular só muda o ponto de vista.
//  2. leve: sem mapa de sombras (sombra falsa), sem antialias, pixel ratio 1, modelo já baixado e aquecido antes do toque,
//     e o 3D do feed é desmontado enquanto a RA está aberta (um só contexto WebGL).
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type Xr = { isSessionSupported(m: string): Promise<boolean>; requestSession(m: string, o?: unknown): Promise<any> }
const xr = (): Xr | undefined => (navigator as unknown as { xr?: Xr }).xr

/** O aparelho/navegador faz RA pelo WebXR (Chrome no Android com os Serviços de RA do Google)? */
export async function suportaWebxrAr(): Promise<boolean> {
  try { return !!xr() && await xr()!.isSessionSupported('immersive-ar') } catch { return false }
}

export type Rotulo = { titulo: string; linhas: string[] }
export type OpcoesAr = { rotulo?: Rotulo; glb: string; nome: string; medidas: string; nota: string; aoAbrir?: () => void; aoFechar?: () => void }
export type EstadoAr = {
  fixado: boolean; achouSuperficie: boolean; visivel: boolean; confirmado: boolean; profundidade: boolean; cartaz: boolean; medidas: boolean; posicao: [number, number, number]; escala: number; giro: number; fase: string
  triangulos: number; chamadas: number; sombraMapa: boolean; ancora: boolean; estavel: number
}
declare global { interface Window { __srAr?: () => EstadoAr } }

// modelo baixado e interpretado antes do toque (cache por endereço)
const cache = new Map<string, Promise<THREE.Group>>()
export function prepararAr(glb: string): Promise<THREE.Group> {
  let p = cache.get(glb)
  if (!p) { p = new GLTFLoader().loadAsync(glb).then(g => g.scene); p.catch(() => cache.delete(glb)); cache.set(glb, p) }
  return p
}

const MIN_DIST = 0.25, MAX_DIST = 1.8      // metros da câmera: nem colado, nem lá longe (onde o ARCore erra)
const QUADROS_ESTAVEIS = 4, TOLERANCIA = 0.03   // 4 quadros seguidos dentro de 3 cm travam o prato

function texturaSombra(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!; const r = g.createRadialGradient(64, 64, 6, 64, 64, 62)
  r.addColorStop(0, 'rgba(0,0,0,0.55)'); r.addColorStop(0.55, 'rgba(0,0,0,0.25)'); r.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c)
}

/** Abre a RA. Chame DENTRO do toque do cliente (o navegador só permite iniciar RA com um toque). */
export async function iniciarAr(o: OpcoesAr): Promise<void> {
  if (!xr()) throw new Error('sem-webxr')
  const carregando = prepararAr(o.glb)                              // já em cache quando o cliente chegou perto do prato
  const ui = document.createElement('div'); ui.className = 'ra-overlay'
  ui.innerHTML = `<div class="ra-topo"><div><b>${esc(o.nome)}</b><small>${esc(o.medidas)}</small></div><button type="button" class="ra-x" aria-label="Fechar">✕</button></div>
    <div class="ra-captura" hidden></div>
    <div class="ra-base"><p class="ra-msg" role="status"></p><div class="ra-botoes"><button type="button" class="ra-mover" hidden>Mover o prato</button><button type="button" class="ra-med" hidden>Tamanho ✓</button><button type="button" class="ra-fixar" hidden>Fixar aqui</button>${o.rotulo ? '<button type="button" class="ra-ing">Ingredientes ✓</button>' : ''}</div><small class="ra-nota">${esc(o.nota)}</small></div>`
  document.body.appendChild(ui)
  const q = <T extends HTMLElement>(s: string) => ui.querySelector(s) as T
  const ing = ui.querySelector('.ra-ing') as HTMLButtonElement | null, med = ui.querySelector('.ra-med') as HTMLButtonElement, fixar = ui.querySelector('.ra-fixar') as HTMLButtonElement
  const msg = q<HTMLElement>('.ra-msg'), captura = q<HTMLElement>('.ra-captura'), mover = q<HTMLButtonElement>('.ra-mover'), fechar = q<HTMLButtonElement>('.ra-x')
  for (const b of [fechar, mover, captura, med, fixar, ...(ing ? [ing] : [])]) b.addEventListener('beforexrselect', e => e.preventDefault())

  let session: any
  try {
    session = await xr()!.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay', 'light-estimation', 'anchors', 'depth-sensing'], domOverlay: { root: ui },
      depthSensing: { usagePreference: ['cpu-optimized', 'gpu-optimized'], dataFormatPreference: ['luminance-alpha', 'float32'] } })   // profundidade: distância da mesa na hora, sem depender da textura
  } catch (e) { ui.remove(); throw e }          // recusou: o 3D do feed segue montado para o plano B (Scene Viewer)
  o.aoAbrir?.()                                  // sessão aberta: o feed desmonta o 3D dele (um só contexto WebGL)

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(1); renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local')
  renderer.shadowMap.enabled = false
  await renderer.xr.setSession(session)

  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8a78, 1.7))
  const sol = new THREE.DirectionalLight(0xffffff, 1.8); sol.position.set(0.6, 1.6, 0.8); scene.add(sol)
  const grupo = new THREE.Group(); grupo.visible = false; scene.add(grupo)       // prato + sombra falsa, movem juntos
  const modelo = await carregando; const cena = modelo.clone(true); cena.scale.setScalar(1)   // o arquivo já está em METROS
  const mats: THREE.Material[] = []                                  // materiais próprios da sessão: o prato fica "fantasma" até a mesa ser confirmada
  cena.traverse(n => { const me = n as THREE.Mesh; me.frustumCulled = false; if (me.isMesh) { me.material = Array.isArray(me.material) ? me.material.map(x => x.clone()) : me.material.clone(); mats.push(...(Array.isArray(me.material) ? me.material : [me.material])) } })
  const fantasma = (on: boolean) => { for (const mt of mats) { mt.transparent = on; mt.opacity = on ? 0.5 : 1 } }
  grupo.add(cena)
  const caixa = new THREE.Box3().setFromObject(cena); const raio = Math.max(caixa.max.x - caixa.min.x, caixa.max.z - caixa.min.z) * 0.9
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(raio * 2, raio * 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false }))
  sombra.position.y = 0.0005; grupo.add(sombra)
  // cartaz com o nome e os ingredientes, de pé atrás do prato, virado para quem projetou
  const cartaz = new THREE.Group(); grupo.add(cartaz); cartaz.visible = !!o.rotulo
  if (o.rotulo) {
    const cv = desenharCartaz(o.rotulo); const larg = 0.34, alt = larg * cv.height / cv.width
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(larg, alt), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false, side: THREE.DoubleSide }))
    pl.position.set(0, alt / 2 + 0.005, -(raio * 0.95)); pl.rotation.x = -0.22; cartaz.add(pl)
  }
  // referência de tamanho: garfo e faca de tamanho real ao lado do prato + régua com a medida (só depois de a mesa ser confirmada)
  const medidas = new THREE.Group(); medidas.visible = false; grupo.add(medidas)
  {
    const dimX = caixa.max.x - caixa.min.x, dimZ = caixa.max.z - caixa.min.z, R = Math.max(dimX, dimZ) / 2
    const aco = new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 0.35, roughness: 0.32 })
    const poli = (pts: [number, number][]) => { const sh = new THREE.Shape(); pts.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); return new THREE.ExtrudeGeometry(sh, { depth: 0.002, bevelEnabled: false }).rotateX(-Math.PI / 2) }
    const garfo = new THREE.Group()                                   // 19 cm
    garfo.add(new THREE.Mesh(poli([[-0.005, 0], [0.005, 0], [0.0065, 0.115], [0.0175, 0.135], [-0.0175, 0.135], [-0.0065, 0.115]]), aco))
    for (let k = 0; k < 4; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.0045, 0.002, 0.058), aco); d.position.set(-0.0135 + k * 0.009, 0.001, -(0.135 + 0.029)); garfo.add(d) }
    const faca = new THREE.Group()                                    // 22 cm
    faca.add(new THREE.Mesh(poli([[0.007, 0], [-0.007, 0], [-0.007, 0.105], [-0.0105, 0.108], [-0.0105, 0.19], [-0.005, 0.222], [0.007, 0.222]]), aco))
    garfo.position.set(-(R + 0.045), 0.0006, 0.095); faca.position.set(R + 0.04, 0.0006, 0.11); medidas.add(garfo, faca)
    const cm = Math.round(Math.max(dimX, dimZ) * 100)
    const lin = new THREE.MeshBasicMaterial({ color: 0xffffff }); const zL = R + 0.04
    const barra = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 0.003).rotateX(-Math.PI / 2), lin); barra.position.set(0, 0.001, zL)
    medidas.add(barra); for (const sx of [-1, 1]) { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.003, 0.02).rotateX(-Math.PI / 2), lin); t.position.set(sx * R, 0.001, zL); medidas.add(t) }
    const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d')!
    g.fillStyle = 'rgba(24,12,40,0.9)'; g.beginPath(); g.roundRect(0, 0, 256, 96, 28); g.fill(); g.fillStyle = '#fff'; g.font = '800 58px "Segoe UI", Roboto, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${cm} cm`, 128, 52)
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace
    const rot = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.0375).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false })); rot.position.set(0, 0.0015, zL + 0.032); medidas.add(rot)
  }
  let medLig = true
  const amostras: number[] = [], pProf = new THREE.Vector3(), mProf = new THREE.Vector3(), vPos = new THREE.Vector3(), vFwd = new THREE.Vector3(), mv = new THREE.Matrix4()
  let depthOk = true, usouProf = false, acumP = 0
  const virar = () => { cartaz.rotation.y = cena.rotation.y; medidas.rotation.y = cena.rotation.y }          // o cartaz não gira junto com o prato
  const mira = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.045, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })); mira.visible = false; scene.add(mira)

  let fixado = false, confirmado = false, desde = performance.now(), achou = false, giro = 0, fase = 'procurando', ancora: any = null, fonte: any = null
  let acum = 0; const media = new THREE.Vector3(), alvo = new THREE.Vector3(), tmp = new THREE.Matrix4(), cam = new THREE.Vector3()
  const texto = (t: string) => { if (msg.textContent !== t) msg.textContent = t }
  let viewer: any = null
  const abrirFonte = async () => {
    viewer ??= await session.requestReferenceSpace('viewer')              // 'point' acha superfície antes de o celular andar para o lado (só 'plane' exige movimento)
    try { fonte = await session.requestHitTestSource({ space: viewer, entityTypes: ['plane', 'point'] }) } catch { fonte = await session.requestHitTestSource({ space: viewer }) }
  }
  const fecharFonte = () => { try { fonte?.cancel() } catch { /* ignora */ } fonte = null }

  const reiniciar = async () => {                                   // volta a procurar superfície (primeira vez e "mover o prato")
    amostras.length = 0; acumP = 0; usouProf = false
    fixado = false; confirmado = false; achou = false; acum = 0; fase = 'procurando'; grupo.visible = false; mira.visible = false; desde = performance.now(); fantasma(true); fixar.hidden = true
    try { ancora?.delete() } catch { /* ignora */ } ancora = null
    mover.hidden = true; captura.hidden = true; med.hidden = true; medidas.visible = false
    texto('Procurando a mesa… o prato se ajusta sozinho.')
    abrirFonte().catch(() => texto('Não consegui detectar a mesa neste aparelho. Toque em Fixar aqui.'))   // sem await: o prato não espera o ARCore ficar pronto
  }
  let x0: number | null = null                                      // girar com o dedo depois de fixado
  captura.addEventListener('pointerdown', e => { x0 = e.clientX; captura.setPointerCapture(e.pointerId) })
  captura.addEventListener('pointermove', e => { if (x0 === null) return; giro += (e.clientX - x0) * 0.012; x0 = e.clientX; cena.rotation.y = giro })
  captura.addEventListener('pointerup', () => { x0 = null })
  mover.addEventListener('click', () => { void reiniciar() })
  fixar.addEventListener('click', () => {                           // plano B: mesa difícil de detectar (lisa, pouca luz) → fixa onde o prato está
    fixado = true; fase = 'fixado-aprox'; fecharFonte(); fixar.hidden = true; mira.visible = false; mover.hidden = false; captura.hidden = false; fantasma(false)
    texto('Prato fixado com distância estimada (a mesa não foi detectada). Se parecer fora do lugar, toque em Mover o prato.')
  })
  med.addEventListener('click', () => { medLig = !medLig; medidas.visible = medLig; med.textContent = medLig ? 'Tamanho ✓' : 'Tamanho' })
  ing?.addEventListener('click', () => { cartaz.visible = !cartaz.visible; ing.textContent = cartaz.visible ? 'Ingredientes ✓' : 'Ingredientes' })

  const encerrar = () => {
    renderer.setAnimationLoop(null); fecharFonte(); try { ancora?.delete() } catch { /* ignora */ }
    renderer.dispose(); ui.remove(); window.__srAr = undefined; o.aoFechar?.()
  }
  fechar.addEventListener('click', () => { session.end().catch(() => encerrar()) })
  session.addEventListener('end', encerrar)

  window.__srAr = () => ({
    fixado, achouSuperficie: achou, visivel: grupo.visible, confirmado, profundidade: usouProf, cartaz: cartaz.visible, medidas: medidas.visible, posicao: [grupo.position.x, grupo.position.y, grupo.position.z], escala: cena.scale.x, giro: cena.rotation.y, fase,
    triangulos: renderer.info.render.triangles, chamadas: renderer.info.render.calls, sombraMapa: renderer.shadowMap.enabled, ancora: !!ancora, estavel: acum,
  })

  const colocar = (pos: THREE.Vector3, hit: any, quadro?: XRFrame, ref?: XRReferenceSpace) => {
    fixado = true; confirmado = true; achou = true; fase = 'fixado'; fecharFonte(); fantasma(false); fixar.hidden = true
    grupo.position.copy(pos); grupo.visible = true; mira.visible = false
    cam.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld)       // nasce de frente para quem olha
    cena.rotation.y = giro = Math.atan2(cam.x - pos.x, cam.z - pos.z); virar()
    mover.hidden = false; captura.hidden = false; med.hidden = false; medidas.visible = medLig
    texto('Prato no tamanho real, fixado na mesa. Garfo e faca servem de comparação. Arraste para girar.')
    if (!hit && quadro && ref && session.enabledFeatures?.includes?.('anchors') && (quadro as any).createAnchor) (quadro as any).createAnchor(new XRRigidTransform({ x: pos.x, y: pos.y, z: pos.z }), ref).then((a: any) => { if (fixado) ancora = a; else a?.delete?.() }).catch(() => { /* sem âncora */ })
    else if (session.enabledFeatures?.includes?.('anchors') && hit?.createAnchor) hit.createAnchor().then((a: any) => { if (fixado) ancora = a; else a?.delete?.() }).catch(() => { /* sem âncora: fica estático */ })
  }

  void reiniciar()
  renderer.setAnimationLoop((_t, frame) => {
    if (frame) {
      const ref = renderer.xr.getReferenceSpace()!
      const vp = frame.getViewerPose(ref)
      if (fixado) {
        if (ancora) { const p = frame.getPose(ancora.anchorSpace, ref); if (p) { tmp.fromArray(p.transform.matrix); grupo.position.setFromMatrixPosition(tmp) } }   // o ARCore corrige a deriva
      } else if (vp) {                                                    // só desenha quando o rastreamento do aparelho já tem posição
        cam.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld)
        let r: any[] = [], ok = false
        if (fonte) {
          r = frame.getHitTestResults(fonte); const pose = r.length ? r[0].getPose(ref) : null
          if (pose) {
            tmp.fromArray(pose.transform.matrix); alvo.setFromMatrixPosition(tmp); const d = cam.distanceTo(alvo)
            ok = tmp.elements[5] > 0.6 && d >= MIN_DIST && d <= MAX_DIST      // superfície quase horizontal (acha antes), a uma distância confiável
          }
        }
        if (ok) {
          if (!achou) { achou = true; texto('Mesa detectada, ajustando o prato…') }
          grupo.position.lerp(alvo, 0.3); grupo.visible = true; mira.visible = false   // desliza do chute inicial até a superfície real
          if (acum === 0 || media.distanceTo(alvo) > TOLERANCIA) { media.copy(alvo); acum = 1 }   // pulou: recomeça a contar
          else { acum++; media.lerp(alvo, 1 / acum) }
          if (acum >= QUADROS_ESTAVEIS && grupo.position.distanceTo(media) < 0.012) colocar(media.clone(), r[0])
        } else {
          acum = 0
          let prof = false
          if (!achou && depthOk) {                                        // profundidade do ARCore (sem depender de textura): ponto do centro da tela, em metros
            try {
              const v = vp.views[0]; const di = (frame as any).getDepthInformation?.(v)
              if (di) {
                const dm: number = di.getDepthInMeters(0.5, 0.5)
                if (dm > 0.25 && dm < 2.2) {
                  amostras.push(dm); if (amostras.length > 5) amostras.shift()
                  const md = [...amostras].sort((a, b) => a - b)[amostras.length >> 1]
                  mv.fromArray(v.transform.matrix); vPos.setFromMatrixPosition(mv); vFwd.set(-mv.elements[8], -mv.elements[9], -mv.elements[10])
                  pProf.copy(vPos).addScaledVector(vFwd, md)
                  if (pProf.y < vPos.y - 0.12) prof = true                  // ignora parede/teto: a mesa fica abaixo do celular
                }
              }
            } catch { depthOk = false }
          }
          if (prof) {
            usouProf = true; if (grupo.visible) grupo.position.lerp(pProf, 0.4); else grupo.position.copy(pProf); grupo.visible = true
            cena.rotation.y = Math.atan2(cam.x - grupo.position.x, cam.z - grupo.position.z); virar()
            if (acumP === 0 || mProf.distanceTo(pProf) > 0.04) { mProf.copy(pProf); acumP = 1 } else { acumP++; mProf.lerp(pProf, 0.2) }
            texto('Medindo a distância da mesa…')
            if (acumP >= 8 && grupo.position.distanceTo(mProf) < 0.02) colocar(mProf.clone(), null, frame, ref)
          } else if (!achou) {                                            // sem superfície nem profundidade: o prato (fantasma) JÁ aparece à frente, na altura estimada da mesa
            acumP = 0
            const m = renderer.xr.getCamera().matrixWorld.elements; const dx = -m[8], dy = -m[9], dz = -m[10]
            const k = dy < -0.15 ? Math.min(1, Math.max(0.4, 0.5 / -dy)) : 0.8   // chute: mesa ~50 cm abaixo do celular
            grupo.position.set(cam.x + dx * k, dy < -0.15 ? cam.y + dy * k : cam.y - 0.5, cam.z + dz * k); grupo.visible = true
            cena.rotation.y = Math.atan2(cam.x - grupo.position.x, cam.z - grupo.position.z); virar()
            const t = performance.now() - desde
            if (t > 5000 && fixar.hidden) fixar.hidden = false
            texto(t > 7000 ? 'Mesa lisa? Aponte também para uma borda ou objeto e mova o celular devagar em círculo. Ou toque em Fixar aqui.' : 'Procurando a mesa… mova o celular devagar. O prato se ajusta sozinho.')
          }
        }
      }
    }
    renderer.render(scene, camera)
  })
}
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

/** Cartaz (textura) com nome e ingredientes: legível a ~1 m, fundo escuro translúcido. */
function desenharCartaz(r: Rotulo): HTMLCanvasElement {
  const W = 1024, pad = 56, fonte = '"Segoe UI", Roboto, Arial, sans-serif'
  const medir = document.createElement('canvas').getContext('2d')!
  const quebrar = (t: string, max: number, f: string) => { medir.font = f; const out: string[] = []; let l = ''; for (const w of t.split(' ')) { const x = l ? l + ' ' + w : w; if (medir.measureText(x).width > max && l) { out.push(l); l = w } else l = x } if (l) out.push(l); return out }
  const tit = quebrar(r.titulo, W - 2 * pad, `800 80px ${fonte}`); const linhas = r.linhas.flatMap(t => quebrar(t, W - 2 * pad - 50, `600 56px ${fonte}`).map((x, i) => (i ? '   ' : '• ') + x))
  const H = pad * 2 + tit.length * 92 + 70 + linhas.length * 74
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!
  g.fillStyle = 'rgba(24,12,40,0.88)'; g.beginPath(); g.roundRect(0, 0, W, H, 56); g.fill()
  g.fillStyle = '#ff9a3c'; g.font = `800 80px ${fonte}`; g.textBaseline = 'top'; let y = pad; for (const t of tit) { g.fillText(t, pad, y); y += 92 }
  g.fillStyle = '#d9c8ff'; g.font = `700 44px ${fonte}`; g.fillText('INGREDIENTES', pad, y + 4); y += 70
  g.fillStyle = '#ffffff'; g.font = `600 56px ${fonte}`; for (const t of linhas) { g.fillText(t, pad, y); y += 74 }
  return c
}
