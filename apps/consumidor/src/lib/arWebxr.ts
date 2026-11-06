// RA própria (WebXR) para Android/Chrome: o prato aparece JÁ na superfície para onde a câmera aponta, em TAMANHO REAL, e o
// cliente toca para fixar. Existe porque o modo pronto do <model-viewer> coloca o modelo a >= 1 m à frente (no ar) e só
// corrige a altura, o que faz o prato aparecer longe, pequeno e fora da mesa.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type Xr = { isSessionSupported(m: string): Promise<boolean>; requestSession(m: string, o?: unknown): Promise<any> }
const xr = (): Xr | undefined => (navigator as unknown as { xr?: Xr }).xr

/** O aparelho/navegador faz RA pelo WebXR (Chrome no Android com os Serviços de RA do Google)? */
export async function suportaWebxrAr(): Promise<boolean> {
  try { return !!xr() && await xr()!.isSessionSupported('immersive-ar') } catch { return false }
}

export type OpcoesAr = { glb: string; nome: string; medidas: string; nota: string; aoFechar?: () => void }
export type EstadoAr = { fixado: boolean; achouSuperficie: boolean; posicao: [number, number, number]; escala: number; giro: number; fase: string }

/** Pontos de entrada de teste/diagnóstico: estado atual da sessão (vazio quando não há RA aberta). */
declare global { interface Window { __srAr?: () => EstadoAr } }

/** Abre a RA. Chame DENTRO do toque do cliente (o navegador só permite iniciar RA com um toque). */
export async function iniciarAr(o: OpcoesAr): Promise<void> {
  if (!xr()) throw new Error('sem-webxr')
  const carregando = new GLTFLoader().loadAsync(o.glb)              // baixa o modelo enquanto a câmera abre
  // ── interface sobre a câmera (DOM overlay) ──
  const ui = document.createElement('div'); ui.className = 'ra-overlay'
  ui.innerHTML = `<div class="ra-topo"><div><b>${esc(o.nome)}</b><small>${esc(o.medidas)}</small></div><button type="button" class="ra-x" aria-label="Fechar">✕</button></div>
    <div class="ra-captura" hidden></div>
    <div class="ra-base"><p class="ra-msg" role="status"></p><div class="ra-botoes"><button type="button" class="ra-mover" hidden>Mover o prato</button></div><small class="ra-nota">${esc(o.nota)}</small></div>`
  document.body.appendChild(ui)
  const q = <T extends HTMLElement>(s: string) => ui.querySelector(s) as T
  const msg = q<HTMLElement>('.ra-msg'), captura = q<HTMLElement>('.ra-captura'), mover = q<HTMLButtonElement>('.ra-mover'), fechar = q<HTMLButtonElement>('.ra-x')
  for (const b of [fechar, mover, captura]) b.addEventListener('beforexrselect', e => e.preventDefault())   // toque nos botões não "fixa" o prato

  let session: any
  try {
    session = await xr()!.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay', 'light-estimation'], domOverlay: { root: ui } })
  } catch (e) { ui.remove(); throw e }

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: false })
  renderer.setPixelRatio(1); renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local')
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap
  await renderer.xr.setSession(session)

  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8a78, 1.6))
  const grupo = new THREE.Group(); grupo.visible = false; scene.add(grupo)       // prato + sombra, movem juntos
  const sol = new THREE.DirectionalLight(0xffffff, 2.2); sol.position.set(0.6, 1.6, 0.8); sol.castShadow = true
  sol.shadow.mapSize.set(1024, 1024); Object.assign(sol.shadow.camera, { left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 4 }); sol.shadow.bias = -0.0005
  grupo.add(sol, sol.target)
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShadowMaterial({ opacity: 0.32 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; grupo.add(chao)
  const mira = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.045, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })); mira.visible = false; scene.add(mira)

  const gltf = await carregando; const modelo = gltf.scene; modelo.scale.setScalar(1)          // o arquivo já está em METROS: nunca se redimensiona
  modelo.traverse(n => { const m = n as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.frustumCulled = false } }); grupo.add(modelo)

  let fixado = false, achou = false, giro = 0, fase = 'procurando'
  const alvo = new THREE.Vector3(), tmp = new THREE.Matrix4(), cam = new THREE.Vector3()
  const texto = (t: string) => { msg.textContent = t }
  texto('Aponte a câmera para a mesa e mova o celular devagar.')

  const viewer = await session.requestReferenceSpace('viewer'); const fonte = await session.requestHitTestSource({ space: viewer })
  session.addEventListener('select', () => {                                   // um toque fixa o prato onde ele está
    if (fixado || !achou) return
    fixado = true; fase = 'fixado'; mira.visible = false; mover.hidden = false; captura.hidden = false
    texto('Prato fixado na mesa. Arraste o dedo para girar.')
  })
  mover.addEventListener('click', () => { fixado = false; fase = 'procurando'; mover.hidden = true; captura.hidden = true; texto('Aponte para outro ponto da mesa e toque para fixar.') })
  let x0: number | null = null                                                 // girar com o dedo depois de fixado
  captura.addEventListener('pointerdown', e => { x0 = e.clientX; captura.setPointerCapture(e.pointerId) })
  captura.addEventListener('pointermove', e => { if (x0 === null) return; giro += (e.clientX - x0) * 0.012; x0 = e.clientX; modelo.rotation.y = giro })
  captura.addEventListener('pointerup', () => { x0 = null })

  const encerrar = () => { renderer.setAnimationLoop(null); try { fonte.cancel() } catch { /* ignora */ } renderer.dispose(); ui.remove(); window.__srAr = undefined; o.aoFechar?.() }
  fechar.addEventListener('click', () => { session.end().catch(() => encerrar()) })
  session.addEventListener('end', encerrar)

  window.__srAr = () => ({ fixado, achouSuperficie: achou, posicao: [grupo.position.x, grupo.position.y, grupo.position.z], escala: modelo.scale.x, giro: modelo.rotation.y, fase })
  renderer.setAnimationLoop((_t, frame) => {
    if (frame && !fixado) {
      const ref = renderer.xr.getReferenceSpace()!; const r = frame.getHitTestResults(fonte)
      const pose = r.length ? r[0].getPose(ref) : null
      if (pose) {
        tmp.fromArray(pose.transform.matrix)
        if (tmp.elements[5] > 0.75) {                                          // só superfície horizontal (mesa/bancada/chão)
          alvo.setFromMatrixPosition(tmp); mira.position.copy(alvo); mira.visible = true; fase = 'seguindo'
          if (!achou) { achou = true; fase = 'seguindo'; grupo.position.copy(alvo); cam.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld); modelo.rotation.y = giro = Math.atan2(cam.x - alvo.x, cam.z - alvo.z); grupo.visible = true; texto('Toque na tela para fixar o prato aqui.') }
          else grupo.position.lerp(alvo, 0.4)                                  // acompanha a mira com suavidade
        } else mira.visible = false
      } else mira.visible = false
    }
    renderer.render(scene, camera)
  })
}
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
