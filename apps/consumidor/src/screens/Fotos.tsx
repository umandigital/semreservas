import { useEffect, useRef, useState } from 'react'
import { avisar } from '../lib/mockStore'

type Moldura = 'classica' | 'favorito' | 'momento'
const NOMES: Record<Moldura, string> = { classica: 'Clássica', favorito: 'Meu prato favorito', momento: 'Momento especial' }
const ROXO = '#2a1148', LARANJA = '#ff7a1a', W = 600, H = 750

function pintar(c: HTMLCanvasElement, img: HTMLImageElement | null, m: Moldura) {
  const x = c.getContext('2d')!; x.fillStyle = ROXO; x.fillRect(0, 0, W, H)
  if (img) { const r = Math.max(W / img.width, H / img.height), w = img.width * r, h = img.height * r; x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h) }
  else { x.fillStyle = '#ffffff22'; x.fillRect(35, 35, W - 70, H - 140); x.fillStyle = '#fff'; x.font = '34px system-ui'; x.textAlign = 'center'; x.fillText('Sua foto aqui', W / 2, H / 2 - 30) }
  x.strokeStyle = LARANJA; x.lineWidth = m === 'momento' ? 30 : 22; x.strokeRect(11, 11, W - 22, H - 22)
  x.fillStyle = ROXO; x.fillRect(11, H - 100, W - 22, 89)
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 30px system-ui'; x.fillText('SemReservas GastroPub', W / 2, H - 52)
  x.font = '22px system-ui'; x.fillStyle = LARANJA
  x.fillText(m === 'favorito' ? 'Meu prato favorito' : m === 'momento' ? 'Momento especial' : 'Um toque. Infinitas possibilidades.', W / 2, H - 22)
  if (m === 'momento') { x.fillStyle = LARANJA; for (const [a, b] of [[60, 70], [520, 90], [90, 520], [500, 480]]) { x.beginPath(); x.arc(a, b, 8, 0, 7); x.fill() } }
}

export function Fotos() {
  const ref = useRef<HTMLCanvasElement>(null); const [img, setImg] = useState<HTMLImageElement | null>(null); const [m, setM] = useState<Moldura>('classica')
  useEffect(() => { if (ref.current) pintar(ref.current, img, m) }, [img, m])
  const escolher = (f?: File) => {
    if (!f) return
    if (f.size > 12e6) return avisar('Escolha uma imagem de até 12 MB.')
    const u = URL.createObjectURL(f), i = new Image(); i.onload = () => { setImg(i); URL.revokeObjectURL(u) }; i.src = u   // a foto não sai do aparelho
  }
  const baixar = () => { const a = document.createElement('a'); a.href = ref.current!.toDataURL('image/png'); a.download = 'semreservas-foto.png'; a.click() }
  const compartilhar = async () => {
    const blob = await new Promise<Blob | null>(r => ref.current!.toBlob(r, 'image/png')); if (!blob) return
    const arq = new File([blob], 'semreservas-foto.png', { type: 'image/png' })
    try { if (navigator.canShare?.({ files: [arq] })) { await navigator.share({ files: [arq] }); return } } catch { return }
    baixar(); avisar('Este aparelho não compartilha direto. A imagem foi baixada.')
  }
  return (
    <section className="tela-int">
      <h1>Fotos com moldura</h1>
      <p className="nota">Escolha uma foto do aparelho. A arte é feita aqui mesmo, sem enviar sua foto a nenhum servidor.</p>
      <label className="rot">Foto<input className="campo" type="file" accept="image/*" onChange={e => escolher(e.target.files?.[0])} aria-label="Escolher foto" /></label>
      <div className="chips" role="tablist" aria-label="Molduras">{(Object.keys(NOMES) as Moldura[]).map(k => <button key={k} role="tab" aria-selected={m === k} className={'chip' + (m === k ? ' on' : '')} onClick={() => setM(k)}>{NOMES[k]}</button>)}</div>
      <canvas ref={ref} width={W} height={H} className="tela-foto" aria-label="Pré-visualização da foto com moldura" />
      <button className="primario grande" onClick={baixar}>Baixar imagem</button>
      <button className="sec grande" onClick={compartilhar}>Compartilhar</button>
      <p className="nota">Compartilhar não comprova que a foto foi publicada em alguma rede.</p>
    </section>
  )
}
