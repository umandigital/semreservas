import { useEffect, useState } from 'react'
import { useClube } from '../lib/clube'

/** Comemoração ao alcançar o preço de um prêmio: aparece uma vez, sem confete piscante, com "Trocar agora" ou "Ver depois". */
export function MetaAtingida({ ir }: { ir: (r: string) => void }) {
  const v = useClube().v; const m = v?.membro; const [meta, setMeta] = useState<{ nome: string; pontos: number } | null>(null)
  useEffect(() => {
    if (!m || !v) return
    const k = 'sr-meta:' + v.email; let antes: number | null = null
    try { const r = localStorage.getItem(k); antes = r == null ? null : Number(r); localStorage.setItem(k, String(m.saldo)) } catch { return }
    if (antes == null || m.saldo <= antes) return
    const novos = v.premios.filter(p => p.custo > antes! && p.custo <= m.saldo && m.visitas >= p.minVisitas)
    const p = novos[novos.length - 1]; if (p) setMeta({ nome: p.nome.split(' (')[0], pontos: m.saldo })
  }, [m?.saldo])   // eslint-disable-line react-hooks/exhaustive-deps
  if (!meta) return null
  return (
    <div className="aviso-premio" role="dialog" aria-modal="true" aria-label="Você alcançou um prêmio"><div className="papel meta">
      <div className="confete" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ left: `${(i * 7) % 100}%`, animationDelay: `${(i % 5) * 0.2}s` }} />)}</div>
      <h2>Parabéns!</h2><p>Você chegou a <b>{meta.pontos} pontos</b> e já pode trocar por:</p>
      <img className="foto-meta" src={import.meta.env.BASE_URL + 'media/gelato.webp'} alt="" onError={e => { e.currentTarget.style.display = 'none' }} /><b className="premio-g">{meta.nome}</b>
      <button className="primario grande" onClick={() => { setMeta(null); ir('/clube') }}>Trocar agora</button><button className="link" onClick={() => setMeta(null)}>Ver depois</button></div></div>
  )
}
