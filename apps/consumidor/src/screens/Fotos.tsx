import { useEffect, useRef, useState } from 'react'
import { avisar } from '../lib/mockStore'
import { useClube } from '../lib/clube'
import { moldurasPublicas } from '../lib/api'
import { getSlug } from '../lib/router'
import { MOLDURAS, TEMA, type MolduraCfg } from '../data/tema'

const W = 900, H = 1350, JAN = { x: 60, y: 430, w: 780, h: 600 }   // janela da foto (tudo em proporção: a arte pronta, se existir, usa a mesma)
const C = TEMA.cores, TXT = C['--txt'], OURO = '#d9b36a', LAR = C['--laranja']
const LAYOUT_PADRAO = { tituloY: 200, tituloPasso: 100, tituloTam: 90, rodapeY: 1150, rodapeTam: 46, nomeY: H - 78, nomeTam: 44 }
const SERIF = 'Georgia, "Times New Roman", serif'

function retArred(x: CanvasRenderingContext2D, a: number, b: number, w: number, h: number, r: number) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath() }
function texto(x: CanvasRenderingContext2D, t: string, cx: number, y: number, tam: number, cor: string, peso = 'italic 700') { x.font = `${peso} ${tam}px ${SERIF}`; x.fillStyle = cor; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText(t, cx, y, W - 140) }
function logo(x: CanvasRenderingContext2D, cor = LAR) { texto(x, TEMA.nome, W / 2, H - 78, 44, cor, 'normal 800'); x.strokeStyle = OURO; x.lineWidth = 3; for (const [a, b] of [[60, 190], [710, 840]]) { x.beginPath(); x.moveTo(a, H - 92); x.lineTo(b, H - 92); x.stroke() } }
function foto(x: CanvasRenderingContext2D, img: HTMLImageElement, borda: string) {
  x.save(); retArred(x, JAN.x, JAN.y, JAN.w, JAN.h, 14); x.clip()
  const r = Math.max(JAN.w / img.width, JAN.h / img.height), w = img.width * r, h = img.height * r; x.drawImage(img, JAN.x + (JAN.w - w) / 2, JAN.y + (JAN.h - h) / 2, w, h); x.restore()
  x.strokeStyle = borda; x.lineWidth = 8; retArred(x, JAN.x, JAN.y, JAN.w, JAN.h, 14); x.stroke()
}
function faixa(x: CanvasRenderingContext2D, t: string, fundo: string, cor: string, borda: string) {
  const w = 640, h = 92, a = (W - w) / 2, b = 1090; x.fillStyle = fundo; retArred(x, a, b, w, h, 16); x.fill(); x.strokeStyle = borda; x.lineWidth = 4; retArred(x, a + 6, b + 6, w - 12, h - 12, 12); x.stroke(); texto(x, t, W / 2, b + 62, 46, cor)
}

/** Desenha a moldura (procedural) ou usa a arte pronta; a foto fica sempre por baixo da janela. */
function pintar(c: HTMLCanvasElement, img: HTMLImageElement, m: MolduraCfg, arte: HTMLImageElement | null) {
  const x = c.getContext('2d')!; x.clearRect(0, 0, W, H)
  if (arte) {   // arte pronta: a foto vai por baixo (um pouco maior que a janela; a arte, opaca nas bordas, cobre o excesso) e o app escreve os textos por cima
    const A = { x: JAN.x - 24, y: JAN.y - 24, w: JAN.w + 48, h: JAN.h + 48 }
    x.fillStyle = C['--bg']; x.fillRect(0, 0, W, H); const r = Math.max(A.w / img.width, A.h / img.height), w = img.width * r, h = img.height * r
    x.save(); x.beginPath(); x.rect(A.x, A.y, A.w, A.h); x.clip(); x.drawImage(img, A.x + (A.w - w) / 2, A.y + (A.h - h) / 2, w, h); x.restore(); x.drawImage(arte, 0, 0, W, H)
    const L = { ...LAYOUT_PADRAO, ...m.layout }, cor = m.corTexto ?? '#f3e8d0'
    m.titulo.forEach((l, i) => texto(x, l, W / 2, L.tituloY + i * L.tituloPasso, L.tituloTam, cor)); texto(x, m.rodape, W / 2, L.rodapeY, L.rodapeTam, m.corRodape ?? cor); texto(x, TEMA.nome, W / 2, L.nomeY, L.nomeTam, m.corNome ?? OURO, 'normal 800'); return }
  if (m.estilo === 'quadro') {            // madeira + quadro-negro
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#7a4524'); g.addColorStop(1, '#4a2813'); x.fillStyle = g; retArred(x, 0, 0, W, H, 40); x.fill()
    x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 2; for (let i = 20; i < H; i += 26) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i + (i % 3)); x.stroke() }
    x.fillStyle = '#26231f'; retArred(x, 34, 34, W - 68, H - 68, 28); x.fill(); x.strokeStyle = '#c98b3c'; x.lineWidth = 6; retArred(x, 34, 34, W - 68, H - 68, 28); x.stroke()
    m.titulo.forEach((l, i) => texto(x, l, W / 2, 190 + i * 110, 104, '#f3e8d0')); x.strokeStyle = LAR; x.lineWidth = 6; x.beginPath(); x.moveTo(260, 390); x.quadraticCurveTo(450, 350, 660, 392); x.stroke()
    foto(x, img, '#f3e8d0'); faixa(x, m.rodape, 'rgba(255,255,255,.05)', '#f3e8d0', '#f3e8d0'); logo(x)
  } else if (m.estilo === 'placa') {      // pergaminho + vinho + placa dourada
    x.fillStyle = '#e8d3a3'; retArred(x, 0, 0, W, H, 36); x.fill(); x.fillStyle = C['--bg3']; retArred(x, 34, 34, W - 68, H - 68, 24); x.fill()
    x.setLineDash([10, 10]); x.strokeStyle = '#d9b36a'; x.lineWidth = 3; retArred(x, 52, 52, W - 104, H - 104, 18); x.stroke(); x.setLineDash([])
    const g = x.createLinearGradient(0, 120, 0, 380); g.addColorStop(0, '#f1d58f'); g.addColorStop(1, '#c79a45'); x.fillStyle = g; retArred(x, 90, 120, W - 180, 250, 60); x.fill(); x.strokeStyle = '#8a6425'; x.lineWidth = 5; retArred(x, 100, 130, W - 200, 230, 52); x.stroke()
    m.titulo.forEach((l, i) => texto(x, l, W / 2, 232 + i * 82, 66, '#3b1a0a')); foto(x, img, OURO); faixa(x, m.rodape, '#e8d3a3', '#3b1a0a', '#8a6425'); logo(x)
  } else {                                // vitral em arco
    x.fillStyle = '#4a1226'; retArred(x, 0, 0, W, H, 40); x.fill(); x.fillStyle = C['--bg3']; retArred(x, 34, 34, W - 68, H - 68, 28); x.fill()
    const cores = ['#e8a33a', '#c0392b', '#e8a33a', '#1f7a46', '#c0392b', '#e8a33a', '#c0392b']; const cx = W / 2, cy = 300
    cores.forEach((cor, i) => { const a0 = Math.PI + (i / cores.length) * Math.PI, a1 = Math.PI + ((i + 1) / cores.length) * Math.PI; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, 350, a0, a1); x.closePath(); x.fillStyle = cor; x.globalAlpha = .88; x.fill(); x.globalAlpha = 1; x.strokeStyle = '#5a2e12'; x.lineWidth = 6; x.stroke() })
    x.fillStyle = C['--bg3']; x.beginPath(); x.arc(cx, cy, 210, Math.PI, 2 * Math.PI); x.lineTo(cx + 210, cy + 120); x.lineTo(cx - 210, cy + 120); x.closePath(); x.fill()
    m.titulo.forEach((l, i) => texto(x, l, W / 2, 250 + i * 92, 74, '#f3e8d0')); foto(x, img, '#8a6425'); faixa(x, m.rodape, '#e8d3a3', '#3b1a0a', '#8a6425'); logo(x)
  }
}

const carregar = (src: string) => new Promise<HTMLImageElement | null>(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src })
const MOSTRA = import.meta.env.BASE_URL + 'media/drink.webp'

/** Miniatura de uma moldura (escolha). */
function Mini({ m, img, ativa, ao }: { m: MolduraCfg; img: HTMLImageElement | null; ativa: boolean; ao: () => void }) {
  const r = useRef<HTMLCanvasElement>(null)
  useEffect(() => { (async () => { if (!r.current || !img) return; const arte = m.png ? await carregar(import.meta.env.BASE_URL + m.png) : null; pintar(r.current, img, m, arte) })() }, [img, m])
  return <button className={'mini-m' + (ativa ? ' on' : '')} aria-pressed={ativa} onClick={ao}><canvas ref={r} width={W} height={H} aria-hidden="true" /><span>{m.nome}</span></button>
}

export function Fotos({ ir }: { ir?: (r: string) => void }) {
  const c = useClube(); const m0 = c.v?.membro; const pts = (a: string) => c.v?.regras.find(r => r.action === a)?.points ?? 0
  const pontuar = async (a: string) => { if (!m0) return; try { const g = await c.ganhar(a); if (g) avisar(`+${g} pontos no seu Clube!`) } catch { /* sem pontos */ } }
  const ref = useRef<HTMLCanvasElement>(null); const [img, setImg] = useState<HTMLImageElement | null>(null); const [propria, setPropria] = useState(false); const [m, setM] = useState<MolduraCfg>(MOLDURAS[0])
  const [amostra, setAmostra] = useState<HTMLImageElement | null>(null); const [lista, setLista] = useState<MolduraCfg[]>(MOLDURAS)
  // Textos e liga/desliga das molduras vêm do painel do dono; sem resposta do servidor valem os embutidos
  useEffect(() => { moldurasPublicas(getSlug()).then(rs => { if (!rs.length) return; const l = MOLDURAS.filter(b => rs.find(r => r.frame_id === b.id)?.enabled !== false).map(b => { const r = rs.find(x => x.frame_id === b.id); return r ? { ...b, titulo: r.title, rodape: r.footer } : b }); if (l.length) { setLista(l); setM(a => l.find(x => x.id === a.id) ?? l[0]) } }).catch(() => { /* mantém as embutidas */ }) }, [])
  useEffect(() => { void carregar(MOSTRA).then(setAmostra) }, [])
  const base = img ?? amostra
  useEffect(() => { (async () => { if (!ref.current || !base) return; const arte = m.png ? await carregar(import.meta.env.BASE_URL + m.png) : null; pintar(ref.current, base, m, arte) })() }, [base, m])
  const escolher = (f?: File) => {
    if (!f) return
    if (f.size > 12e6) return avisar('Escolha uma imagem de até 12 MB.')
    const u = URL.createObjectURL(f), i = new Image(); i.onload = () => { setImg(i); setPropria(true); URL.revokeObjectURL(u) }; i.src = u   // a foto não sai do aparelho
  }
  const baixar = () => { const a = document.createElement('a'); a.href = ref.current!.toDataURL('image/png'); a.download = 'semreservas-foto.png'; a.click() }
  const salvarOuCompartilhar = async () => {
    if (!propria) return avisar('Escolha ou tire uma foto primeiro.')
    const blob = await new Promise<Blob | null>(r => ref.current!.toBlob(r, 'image/png')); if (!blob) return
    const arq = new File([blob], 'semreservas-foto.png', { type: 'image/png' })
    try { if (navigator.canShare?.({ files: [arq] })) { await navigator.share({ files: [arq] }); void pontuar('photo_frame'); void pontuar('share_photo'); return } } catch { return }
    baixar(); void pontuar('photo_frame'); avisar('A imagem foi salva no aparelho.')
  }
  return (
    <section className="tela-int fotos">
      <h1>Fotos com moldura</h1>
      {!propria && <p className="selo-demo">Prévia demonstrativa</p>}
      <canvas ref={ref} width={W} height={H} className="tela-foto" aria-label="Pré-visualização da foto com moldura" />
      <h2>Escolha uma moldura</h2>
      <div className="minis">{lista.map(x => <Mini key={x.id} m={x} img={base} ativa={m.id === x.id} ao={() => setM(x)} />)}</div>
      <div className="dois">
        <label className="sec botao-arq">Tirar foto<input type="file" accept="image/*" capture="environment" onChange={e => escolher(e.target.files?.[0])} /></label>
        <label className="sec botao-arq">Escolher foto<input type="file" accept="image/*" onChange={e => escolher(e.target.files?.[0])} /></label>
      </div>
      <button className="primario grande" onClick={salvarOuCompartilhar}>Salvar ou compartilhar{m0 && pts('photo_frame') ? ` (+${pts('photo_frame')} pontos)` : ''}</button>
      <p className="nota">Você escolhe a foto. Nada é publicado automaticamente e a foto não sai do seu aparelho.</p>
      {ir && !m0 && <button className="link" onClick={() => ir('/entrar')}>Entre no Clube para ganhar pontos por isso</button>}
    </section>
  )
}
