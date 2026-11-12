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

export type OpcoesAr = { glb: string; nome: string; medidas: string; nota: string; aoAbrir?: () => void; aoFechar?: () => void }
export type EstadoAr = {
  fixado: boolean; achouSuperficie: boolean; visivel: boolean; posicao: [number, number, number]; escala: number; giro: number; fase: string
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

const MIN_DIST = 0.35, MAX_DIST = 2.5      // metros da câmera: nem colado, nem lá longe (onde o ARCore erra)
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
    <div class="ra-base"><p class="ra-msg" role="status"></p><div class="ra-botoes"><button type="button" class="ra-mover" hidden>Mover o prato</button></div><small class="ra-nota">${esc(o.nota)}</small></div>`
  document.body.appendChild(ui)
  const q = <T extends HTMLElement>(s: string) => ui.querySelector(s) as T
  const msg = q<HTMLElement>('.ra-msg'), captura = q<HTMLElement>('.ra-captura'), mover = q<HTMLButtonElement>('.ra-mover'), fechar = q<HTMLButtonElement>('.ra-x')
  for (const b of [fechar, mover, captura]) b.addEventListener('beforexrselect', e => e.preventDefault())

  let session: any
  try {
    session = await xr()!.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay', 'light-estimation', 'anchors'], domOverlay: { root: ui } })
  } catch (e) { ui.remove(); throw e }          // recusou: o 3D do feed segue montado para o plano B (Scene Viewer)
  o.aoAbrir?.()                                  // sessão aberta: o feed desmonta o 3D dele (um só contexto WebGL)
  await new Promise(r => setTimeout(r, 50))

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(1); renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local')
  renderer.shadowMap.enabled = false
  await renderer.xr.setSession(session)

  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8a78, 1.7))
  const sol = new THREE.DirectionalLight(0xffffff, 1.8); sol.position.set(0.6, 1.6, 0.8); scene.add(sol)
  const grupo = new THREE.Group(); grupo.visible = false; scene.add(grupo)       // prato + sombra falsa, movem juntos
  const modelo = await carregando; const cena = modelo.clone(true); cena.scale.setScalar(1)   // o arquivo já está em METROS
  cena.traverse(n => { (n as THREE.Mesh).frustumCulled = false }); grupo.add(cena)
  const caixa = new THREE.Box3().setFromObject(cena); const raio = Math.max(caixa.max.x - caixa.min.x, caixa.max.z - caixa.min.z) * 0.9
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(raio * 2, raio * 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false }))
  sombra.position.y = 0.0005; grupo.add(sombra)
  const mira = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.045, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })); mira.visible = false; scene.add(mira)
  try { await renderer.compileAsync(scene, camera) } catch { /* aquecimento é opcional */ }

  let fixado = false, achou = false, giro = 0, fase = 'procurando', ancora: any = null, fonte: any = null
  let acum = 0; const media = new THREE.Vector3(), alvo = new THREE.Vector3(), tmp = new THREE.Matrix4(), cam = new THREE.Vector3()
  const texto = (t: string) => { msg.textContent = t }
  const viewer = await session.requestReferenceSpace('viewer')
  const abrirFonte = async () => {              // 'point' acha superfície antes de o celular andar para o lado (só 'plane' exige movimento)
    try { fonte = await session.requestHitTestSource({ space: viewer, entityTypes: ['plane', 'point'] }) } catch { fonte = await session.requestHitTestSource({ space: viewer }) }
  }
  const fecharFonte = () => { try { fonte?.cancel() } catch { /* ignora */ } fonte = null }

  const reiniciar = async () => {                                   // volta a procurar superfície (primeira vez e "mover o prato")
    fixado = false; achou = false; acum = 0; fase = 'procurando'; grupo.visible = false; mira.visible = false
    try { ancora?.delete() } catch { /* ignora */ } ancora = null
    mover.hidden = true; captura.hidden = true
    texto('Procurando a mesa… o prato se ajusta sozinho.')
    await abrirFonte()
  }
  let x0: number | null = null                                      // girar com o dedo depois de fixado
  captura.addEventListener('pointerdown', e => { x0 = e.clientX; captura.setPointerCapture(e.pointerId) })
  captura.addEventListener('pointermove', e => { if (x0 === null) return; giro += (e.clientX - x0) * 0.012; x0 = e.clientX; cena.rotation.y = giro })
  captura.addEventListener('pointerup', () => { x0 = null })
  mover.addEventListener('click', () => { void reiniciar() })

  const encerrar = () => {
    renderer.setAnimationLoop(null); fecharFonte(); try { ancora?.delete() } catch { /* ignora */ }
    renderer.dispose(); ui.remove(); window.__srAr = undefined; o.aoFechar?.()
  }
  fechar.addEventListener('click', () => { session.end().catch(() => encerrar()) })
  session.addEventListener('end', encerrar)

  window.__srAr = () => ({
    fixado, achouSuperficie: achou, visivel: grupo.visible, posicao: [grupo.position.x, grupo.position.y, grupo.position.z], escala: cena.scale.x, giro: cena.rotation.y, fase,
    triangulos: renderer.info.render.triangles, chamadas: renderer.info.render.calls, sombraMapa: renderer.shadowMap.enabled, ancora: !!ancora, estavel: acum,
  })

  const colocar = (pos: THREE.Vector3, hit: any) => {
    fixado = true; achou = true; fase = 'fixado'; fecharFonte()
    grupo.position.copy(pos); grupo.visible = true; mira.visible = false
    cam.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld)       // nasce de frente para quem olha
    cena.rotation.y = giro = Math.atan2(cam.x - pos.x, cam.z - pos.z)
    mover.hidden = false; captura.hidden = false
    texto('Prato fixado na mesa. Arraste o dedo para girar.')
    if (session.enabledFeatures?.includes?.('anchors') && hit?.createAnchor) hit.createAnchor().then((a: any) => { if (fixado) ancora = a; else a?.delete?.() }).catch(() => { /* sem âncora: fica estático */ })
  }

  await reiniciar()
  renderer.setAnimationLoop((_t, frame) => {
    if (frame) {
      const ref = renderer.xr.getReferenceSpace()!
      if (fixado) {
        if (ancora) { const p = frame.getPose(ancora.anchorSpace, ref); if (p) { tmp.fromArray(p.transform.matrix); grupo.position.setFromMatrixPosition(tmp) } }   // o ARCore corrige a deriva
      } else if (fonte) {
        const r = frame.getHitTestResults(fonte); const pose = r.length ? r[0].getPose(ref) : null
        let ok = false
        if (pose) {
          tmp.fromArray(pose.transform.matrix); alvo.setFromMatrixPosition(tmp)
          cam.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld); const d = cam.distanceTo(alvo)
          ok = tmp.elements[5] > 0.75 && d >= MIN_DIST && d <= MAX_DIST        // superfície horizontal, a uma distância confiável
        }
        cam.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld)
        if (ok) {
          if (!achou) { achou = true; grupo.position.copy(alvo) } else grupo.position.lerp(alvo, 0.5)   // vai para a superfície real
          grupo.visible = true; mira.visible = false
          if (acum === 0 || media.distanceTo(alvo) > TOLERANCIA) { media.copy(alvo); acum = 1 }   // pulou: recomeça a contar
          else { acum++; media.lerp(alvo, 1 / acum) }
          if (acum >= QUADROS_ESTAVEIS) colocar(media.clone(), r[0])
        } else {
          acum = 0; mira.visible = false
          if (!achou) {                                                   // ainda sem superfície: o prato JÁ aparece à frente, na altura estimada da mesa
            const m = renderer.xr.getCamera().matrixWorld.elements; const dx = -m[8], dy = -m[9], dz = -m[10]
            const k = dy < -0.15 ? Math.min(1.6, (-0.7) / dy) : 0.9
            grupo.position.set(cam.x + dx * k, cam.y - 0.7, cam.z + dz * k); grupo.visible = true
            cena.rotation.y = Math.atan2(cam.x - grupo.position.x, cam.z - grupo.position.z)
          }
        }
      }
    }
    renderer.render(scene, camera)
  })
}
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
