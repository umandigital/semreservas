import { useEffect, useRef, useState } from 'react'
import type { Item } from '../data/cardapio'
import { media } from '../lib/util'
import type { ModeloEl } from '../ui/model-viewer'

/** Visor 3D e realidade aumentada. Carregado sob demanda: o código do <model-viewer> só baixa quando o cliente toca em "Projetar na mesa". */
export default function VisorAR({ item, fechar }: { item: Item; fechar: () => void }) {
  const m = item.modelo!
  const ref = useRef<ModeloEl | null>(null)
  const [pronto, setPronto] = useState(false); const [ra, setRa] = useState<boolean | null>(null); const [erro, setErro] = useState(false); const [dica, setDica] = useState(false)
  useEffect(() => { import('@google/model-viewer').then(() => setPronto(true)).catch(() => setErro(true)) }, [])
  useEffect(() => {
    const el = ref.current; if (!pronto || !el) return
    const ok = () => setRa(!!el.canActivateAR); const falha = () => setErro(true)
    el.addEventListener('load', ok); el.addEventListener('error', falha); el.addEventListener('ar-status', e => { if ((e as CustomEvent).detail?.status === 'session-started') setDica(true) })
    return () => { el.removeEventListener('load', ok); el.removeEventListener('error', falha) }
  }, [pronto])
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && fechar(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [fechar])
  const projetar = async () => { try { await ref.current?.activateAR() } catch { setErro(true) } }
  return (
    <div className="visor-ar" role="dialog" aria-modal="true" aria-label={`${item.nome} em 3D`}>
      <header><div><b>{item.nome}</b><small>{m.medidas}</small></div><button className="icone" onClick={fechar} aria-label="Fechar">✕</button></header>
      <div className="visor-ar-cena">
        {!pronto && !erro && <p className="nota carregando-ar">Carregando o prato em 3D…</p>}
        {erro && <p className="alerta" role="alert">Não foi possível carregar o 3D neste aparelho. Veja as fotos do prato no cardápio.</p>}
        {pronto && !erro && (
          <model-viewer ref={ref} src={media(m.glb)} poster={m.poster ? media(m.poster) : undefined} alt={`Modelo 3D de ${item.nome}`}
            ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor" ar-scale="fixed" camera-controls touch-action="pan-y" auto-rotate
            shadow-intensity="1.1" shadow-softness="0.9" exposure="1.05" environment-image="neutral" interaction-prompt="none" style={{ width: '100%', height: '100%' }}>
            <button slot="ar-button" hidden aria-hidden="true" tabIndex={-1} />   {/* esconde o botão padrão: usamos o nosso "Projetar na mesa" */}
          </model-viewer>
        )}
      </div>
      <footer>
        <p className="nota">{ra === false ? 'Para projetar na mesa, abra no seu celular. Aqui você pode girar o prato com o mouse.' : 'Arraste para girar. Toque em "Projetar na mesa", aponte a câmera para a mesa e mova o celular devagar.'}</p>
        <button className="primario grande" disabled={!ra} onClick={projetar}>{ra === null && !erro ? 'Preparando…' : 'Projetar na mesa'}</button>
        {dica && <p className="nota">Quando a superfície aparecer, toque nela para colocar o prato.</p>}
        <p className="nota">{m.nota}</p>
      </footer>
    </div>
  )
}
