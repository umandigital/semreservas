import { useEffect, useRef, useState } from 'react'
import { CATEGORIAS, ITENS } from '../data/cardapio'
import { aberto, assumir, concluir, marcarEsgotado, reiniciarDemo, useShared } from '../lib/mockStore'

const min = (t: number, agora: number) => { const m = Math.floor((agora - t) / 60000); return m < 1 ? 'agora' : `${m} min` }

export function Equipe() {
  const { calls, soldOut } = useShared()
  const [som, setSom] = useState(false); const [aba, setAba] = useState<'fila' | 'cardapio'>('fila'); const [agora, setAgora] = useState(Date.now())
  const ctx = useRef<AudioContext | null>(null); const lock = useRef<{ release(): Promise<void> } | null>(null)
  const abertos = calls.filter(aberto).sort((a, b) => a.createdAt - b.createdAt)
  const pend = abertos.filter(c => c.status === 'PENDING').length

  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), 15000); return () => clearInterval(t) }, [])
  useEffect(() => { document.title = pend ? `(${pend}) CHAMADO · SemReservas` : 'Equipe · SemReservas' }, [pend])
  // sinal sonoro repetido enquanto houver chamado sem atendente (só depois do gesto "Ativar som")
  useEffect(() => {
    if (!som || !pend || !ctx.current) return
    const bip = () => { const c = ctx.current!; const o = c.createOscillator(); const g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.2; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.25); navigator.vibrate?.(200) }
    bip(); const t = setInterval(bip, 3000); return () => clearInterval(t)
  }, [som, pend])

  async function ativarSom() {
    ctx.current = ctx.current ?? new AudioContext(); await ctx.current.resume(); setSom(true)
    try { lock.current = await (navigator as any).wakeLock?.request('screen') ?? null } catch { /* sem suporte */ }
  }
  return (
    <section className="equipe">
      <header>
        <b>Equipe · GastroPub</b>
        <button className={som ? 'sec' : 'primario'} onClick={() => som ? setSom(false) : ativarSom()}>{som ? 'Som ativo (silenciar)' : 'Ativar som'}</button>
      </header>
      {!som && <p className="alerta">Som desligado. Toque em "Ativar som" para ser avisado. O alerta visual funciona sempre.</p>}
      <div className="abas"><button className={aba === 'fila' ? 'on' : ''} onClick={() => setAba('fila')}>Chamados {pend > 0 && <span className="badge">{pend}</span>}</button><button className={aba === 'cardapio' ? 'on' : ''} onClick={() => setAba('cardapio')}>Acabou hoje</button></div>
      {aba === 'fila' ? (
        <>
          {pend > 0 && <div className="banner-alerta" role="alert">{pend === 1 ? '1 CHAMADO AGUARDANDO' : `${pend} CHAMADOS AGUARDANDO`}</div>}
          {abertos.length === 0 && <p className="vazio">Nenhum chamado. Tudo em dia.</p>}
          <ul className="fila">{abertos.map(c => (
            <li key={c.id} className={c.status === 'PENDING' ? 'novo' : ''}>
              <div className="mesa-xl">Mesa {c.mesa}</div>
              <div className="linha"><b>{c.motivo}</b><span>{min(c.createdAt, agora)} · cód. {c.code}</span></div>
              {c.status === 'PENDING'
                ? <button className="primario grande" onClick={() => assumir(c.id)}>Assumir</button>
                : <button className="sec grande" onClick={() => concluir(c.id)}>Concluir atendimento</button>}
            </li>))}</ul>
        </>
      ) : (
        <div className="esg">
          {CATEGORIAS.map(cat => (
            <div key={cat}>
              <h3>{cat}</h3>
              {ITENS.filter(i => i.cat === cat).map(i => (
                <label key={i.id} className="toggle">
                  <span>{i.nome}</span>
                  <input type="checkbox" checked={soldOut.includes(i.id)} onChange={e => marcarEsgotado(i.id, e.target.checked)} />
                  <i>{soldOut.includes(i.id) ? 'Acabou' : 'Tem'}</i>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
      <button className="link" onClick={() => confirm('Apagar chamados e esgotados de teste?') && reiniciarDemo()}>Reiniciar dados de teste</button>
    </section>
  )
}
