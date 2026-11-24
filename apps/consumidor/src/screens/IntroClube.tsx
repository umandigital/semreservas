import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CLUBE } from '../data/clube'
import { CENAS, DUVIDAS } from '../data/introClube'
import { TEMA } from '../data/tema'
import { IconCamera, IconCartao, IconCheck, IconConta, IconEstrela, IconUsuario } from '../ui/Icons'

export const INTRO_KEY = 'sr-intro-clube'

/** O "S" da marca como guia: o traço se desenha e as ondas do "toque" pulsam. */
const S = ({ tam = 76, ondas = true }: { tam?: number; ondas?: boolean }) => (
  <svg className="s-guia" style={{ width: tam, height: tam }} viewBox="0 0 100 100" aria-hidden="true">
    <path className="s-traco" d="M62 24c-6-8-30-8-30 6 0 16 36 8 36 28 0 16-28 18-38 6" />
    {ondas && <><path className="onda o1" d="M68 12a22 22 0 0120 20" /><path className="onda o2" d="M68 2a32 32 0 0130 30" /></>}
  </svg>)

/** Elemento que entra no tempo certo (d = atraso em s) e, se pedido, sai (o = segundo em que some). */
type AP = { d?: number; o?: number; cls?: string; style?: CSSProperties; children?: ReactNode }
const A = ({ d = 0, o, cls = '', style, children }: AP) => (
  <div className={'an ' + cls + (o != null ? ' sai' : '')} style={{ ['--d' as string]: d + 's', ['--o' as string]: (o ?? 0) + 's', ...style }}>{children}</div>)

/** Número que muda com o tempo: cada valor aparece no seu intervalo (vals[k] a partir de ini + k*passo). */
function Conta({ vals, ini, passo, cls = '' }: { vals: (string | number)[]; ini: number; passo: number; cls?: string }) {
  return <span className={'conta ' + cls}>{vals.map((v, k) => <b key={k} className={k === vals.length - 1 ? 'ult' : ''} style={{ ['--d' as string]: ini + k * passo + 's', ['--p' as string]: passo + 's' }}>{v}</b>)}<b className="vaz">{vals.reduce((m, v) => String(v).length > String(m).length ? v : m, vals[0])}</b></span>
}
const Mais = ({ n, d, x = 0, y = 0 }: { n: string; d: number; x?: number; y?: number }) => <div className="mais" style={{ ['--d' as string]: d + 's', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}>{n}</div>
const Toque = ({ d, style }: { d: number; style?: CSSProperties }) => <div className="toque" style={{ ['--d' as string]: d + 's', ...style }} aria-hidden="true" />
const Fone = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div className="fone" style={style}><div className="tela">{children}</div></div>

/* ───────────────────────── As cenas (SVG/CSS; os textos estão em data/introClube.ts) ───────────────────────── */
function CenaAbre() {
  return <div className="cena abre"><A d={0}><S tam={170} /></A><A d={1.6} cls="up"><b className="nome-abre">{CLUBE.nome}</b></A></div>
}

function CenaOque() {
  return <div className="cena">
    <A d={0.2} cls="pop" style={{ left: 8, top: 24 }}><div className="ana"><IconUsuario /><b>Ana</b></div></A>
    <A d={1} cls="pop" style={{ left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center' }}>
      <div className="cartao-m"><small>Clube</small><span className="lbl">Seus pontos</span><b className="gr-n"><Conta vals={[0, 30, 60, 90]} ini={1.6} passo={0.9} /></b></div></A>
    <Mais n="+30" d={2.4} x={128} y={-50} /><Mais n="+30" d={3.3} x={128} y={-50} /><Mais n="+30" d={4.2} x={128} y={-50} />
    <A d={5.6} cls="up" style={{ left: 0, right: 0, bottom: 28, textAlign: 'center' }}><svg viewBox="0 0 24 24" className="seta" aria-hidden="true"><path d="M12 3v14m0 0l-5-5m5 5l5-5" /></svg></A>
    <A d={6.2} cls="pop" style={{ left: 0, right: 0, bottom: 4, display: 'flex', justifyContent: 'center' }}><div className="premio-m"><IconEstrela cheio /> <b>Prêmio</b></div></A>
  </div>
}

function CenaEntrar() {
  return <div className="cena">
    <Fone style={{ left: '50%', top: 8, marginLeft: -70, width: 140, height: 270 }}>
      <A d={0} o={4.6} style={{ position: 'absolute', inset: 0 }}>
        <div className="tl"><S tam={48} ondas={false} /><b className="t">Entre no Clube</b><div className="bt-g"><i>G</i>Entrar com Google</div></div></A>
      <A d={5} style={{ position: 'absolute', inset: 0 }}>
        <div className="tl"><b className="t">Falta só um passo</b>
          <div className="campo"><small>Nome</small><span className="digita" style={{ ['--d' as string]: '5.6s', ['--w' as string]: '9ch' }}>Ana Souza</span></div>
          <div className="campo"><small>Aniversário</small><span className="digita" style={{ ['--d' as string]: '6.8s', ['--w' as string]: '5ch' }}>12/03</span></div>
          <div className="bt-g ok">Concluir</div></div></A>
      <Toque d={3} style={{ left: 70, top: 162 }} /><Toque d={8.6} style={{ left: 70, top: 226 }} />
    </Fone>
    <Mais n="+50" d={9.2} x={70} y={30} />
    <A d={9.4} cls="pop" style={{ right: 0, top: 70 }}><div className="selo">Bem-vinda, Ana!</div></A>
  </div>
}

function CenaVisita() {
  return <div className="cena">
    <div className="mesa-m" />
    <A d={0.3} cls="pop" style={{ left: 36, bottom: 62 }}><div className="placa"><S tam={44} /></div></A>
    <div className="fone-anda"><Fone style={{ width: 124, height: 172, position: "relative" }}>
      <A d={3.6} style={{ position: 'absolute', inset: 0 }}><div className="tl pq"><IconCheck /><b className="t">Visita registrada!</b></div></A></Fone></div>
    <Mais n="+30" d={3.8} x={20} y={-70} />
    <A d={6.5} cls="pop" style={{ right: 0, top: 18 }}><div className="selo">1 vez por dia</div></A>
    <A d={0.3} style={{ left: 0, bottom: 4 }}><small className="rot">Placa da mesa</small></A>
  </div>
}

function CenaVoltar() {
  const dias = Array.from({ length: 14 }, (_, k) => k + 1); const vis: Record<number, number> = { 2: 1.2, 6: 3.4, 10: 7 }
  return <div className="cena">
    <div className="cal">{dias.map(n => <div key={n} className={'dia' + (vis[n] ? ' v' : '')}>{n}{vis[n] != null && <span className="ck" style={{ ['--d' as string]: vis[n] + 's' }}><IconCheck /></span>}</div>)}</div>
    <Mais n="+30" d={1.4} x={-100} y={-70} /><Mais n="+30" d={3.6} x={-30} y={-70} />
    <A d={4.8} cls="pop" style={{ left: 0, right: 0, top: 168 }}><div className="fita">Voltou em menos de 7 dias: <b>+20 de bônus</b></div></A>
    <Mais n="+30" d={7.2} x={40} y={-30} />
    <A d={8.6} cls="pop" style={{ left: 0, right: 0, top: 214 }}><div className="fita">3 visitas no mês: <b>+40 de bônus</b></div></A>
  </div>
}

function CenaOutras() {
  const linhas: [ReactNode, string, string, number][] = [[<IconEstrela cheio key="e" />, 'Dar a sua opinião', '+10', 0.4], [<IconCamera key="c" />, 'Foto com moldura', '+15', 4.4], [<IconConta key="u" />, 'Indicar um amigo', '+100', 8.4]]
  return <div className="cena col">
    {linhas.map(([ic, t, p, d], k) => <A key={k} d={d} cls="pop"><div className="linha-o"><span className="ic">{ic}</span><b>{t}</b><em className="pts" style={{ ['--d' as string]: d + 0.9 + 's' }}>{p}</em></div></A>)}
    <A d={10.6} cls="up"><div className="limite"><span>Limite do mês</span><i><u /></i></div></A>
  </div>
}

function CenaTrocar() {
  return <div className="cena">
    <A d={0} style={{ left: 0, right: 0, top: 0 }}>
      <div className="meta"><div className="meta-t"><span>Seus pontos: <b><Conta vals={[0, 200]} ini={0.2} passo={2} /></b></span><span>Prêmio: <b>200</b></span></div><i><u /></i></div></A>
    <A d={2.8} cls="pop" style={{ right: 0, top: 44 }}><div className="premio-m on"><IconEstrela cheio /> <b>Prêmio liberado!</b></div></A>
    <Fone style={{ left: 0, top: 84, width: 130, height: 190 }}>
      <A d={3.6} o={6.2} style={{ position: 'absolute', inset: 0 }}><div className="tl"><b className="t">Seu prêmio</b><div className="bt-g ok">Trocar</div></div></A>
      <A d={6.6} style={{ position: 'absolute', inset: 0 }}><div className="tl"><b className="t">Comprovante</b><div className="cod">A7K2</div><small>Mostre ao garçom</small></div></A>
      <Toque d={5.4} style={{ left: 65, top: 120 }} />
    </Fone>
    <A d={9} cls="pop" style={{ right: 6, top: 130 }}><div className="garcom"><IconUsuario /><b>Garçom</b><div className="ent"><IconCheck /> Entregue</div></div></A>
  </div>
}

function CenaNumeros() {
  return <div className="cena col">
    <div className="duplo-n">
      <div className="num-c"><small>Seus pontos</small><b><Conta vals={[200, 0, 30]} ini={0.4} passo={3.4} /></b></div>
      <div className="num-c tot"><small>Total ganho</small><b><Conta vals={[200, 200, 230]} ini={0.4} passo={3.4} /></b></div>
    </div>
    <div className="hist"><A d={0.4} o={3.8}><p>Ana tem 200 pontos.</p></A><A d={3.8} o={7.2}><p>Ela troca um prêmio de 200: os pontos saem, o total fica.</p></A><A d={7.2}><p>Na visita seguinte ganha +30: os dois sobem.</p></A></div>
  </div>
}

function CenaRegras() {
  const r: [string, string, number][] = [['Restaurante A', '+20 por visita', 0.4], ['Restaurante B', '+30 por visita', 2.2], ['Restaurante C', '+25 por visita', 4]]
  return <div className="cena col">{r.map(([n, v, d]) => <A key={n} d={d} cls="pop"><div className="linha-o"><span className="ic"><IconCartao /></span><b>{n}</b><em className="pts" style={{ ['--d' as string]: d + 0.4 + 's' }}>{v}</em></div></A>)}
    <A d={6} cls="up"><div className="limite aviso">Cada um escolhe os seus números e os seus prêmios.</div></A></div>
}

const PALCOS: Record<string, () => ReactNode> = { abre: CenaAbre, oque: CenaOque, entrar: CenaEntrar, visita: CenaVisita, voltar: CenaVoltar, outras: CenaOutras, trocar: CenaTrocar, numeros: CenaNumeros, regras: CenaRegras }

/* ───────────────────────── O player ───────────────────────── */
export function IntroClube({ fechar, ir }: { fechar: () => void; ir: (r: string) => void }) {
  const reduz = useMemo(() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } }, [])
  const [i, setI] = useState(0); const [pausado, setPausado] = useState(reduz); const [lista, setLista] = useState(false); const [aberta, setAberta] = useState<number | null>(null)
  const [rodada, setRodada] = useState(0)
  const cena = CENAS[i]; const ultimo = i === CENAS.length - 1
  const t = useRef({ ini: 0, gasto: 0 })
  // Avanço automático: cada cena anima sozinha e passa para a próxima; pausar congela o tempo e a animação.
  useEffect(() => {
    if (pausado || !cena.seg || ultimo) return
    t.current.ini = Date.now(); const resta = cena.seg * 1000 - t.current.gasto
    const id = setTimeout(() => { t.current.gasto = 0; setI(x => Math.min(x + 1, CENAS.length - 1)) }, Math.max(resta, 0))
    return () => { clearTimeout(id); t.current.gasto += Date.now() - t.current.ini }
  }, [i, pausado, cena.seg, ultimo, rodada])
  const ir_ = (k: number) => { t.current.gasto = 0; setI(Math.max(0, Math.min(k, CENAS.length - 1))); setLista(false); setRodada(r => r + 1) }
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); if (e.key === 'ArrowRight') ir_(i + 1); if (e.key === 'ArrowLeft') ir_(i - 1); if (e.key === ' ') { e.preventDefault(); setPausado(p => !p) } }; addEventListener('keydown', f); return () => removeEventListener('keydown', f) }) // eslint-disable-line react-hooks/exhaustive-deps
  const Palco = PALCOS[cena.id]
  return (
    <div className={'intro v' + (pausado ? ' pausado' : '')} role="dialog" aria-modal="true" aria-label="Como o Clube funciona">
      <div className="intro-topo">
        <button className="intro-x" onClick={fechar} aria-label="Fechar">✕</button>
        <div className="segs" aria-hidden="true">{CENAS.map((c, k) => <i key={c.id} className={k < i ? 'ok' : k === i ? 'on' : ''}>{k === i && c.seg > 0 && <u key={rodada + '-' + i} style={{ animationDuration: c.seg + 's' }} />}</i>)}</div>
        <button className="link" onClick={() => setLista(!lista)}>Capítulos</button>
      </div>
      {lista ? <ul className="intro-lista">{CENAS.map((c, k) => <li key={c.id}><button onClick={() => ir_(k)}>{k + 1}. {c.titulo || 'Abertura'}</button></li>)}</ul> : (
        <div className="intro-corpo" key={i + '-' + rodada}>
          {cena.passo && <span className="passo">Passo {cena.passo} de 5</span>}
          {cena.titulo && <h2>{cena.titulo}</h2>}
          {Palco && <div className="palco-v" onClick={() => setPausado(p => !p)} role="img" aria-label={cena.legenda}><Palco />{cena.id !== 'abre' && <small className="exemplo">Exemplo</small>}</div>}
          {cena.id === 'duvidas' && <ul className="duvidas">{DUVIDAS.map(([p, r], k) => <li key={k}><button aria-expanded={aberta === k} onClick={() => setAberta(aberta === k ? null : k)}>{p}</button>{aberta === k && <p>{r}</p>}</li>)}</ul>}
          {cena.id === 'fecho' && <div className="fecho">
            <ol><li><b>Entre</b> com o Google.</li><li><b>Visite</b> e encoste na placa.</li><li><b>Junte</b> pontos e <b>troque</b> por prêmios.</li></ol>
            <p className="aviso-ex">Os números do vídeo são exemplos. Os do restaurante estão na tela do Clube.</p>
            <button className="sec grande" onClick={() => { fechar(); ir('/clube/ganhar') }}>Ver todas as formas de ganhar</button>
            <button className="link" onClick={() => ir_(0)}>Ver de novo</button></div>}
          {cena.legenda && <p className="legenda">{cena.legenda}</p>}
          {cena.frase && <p className="resumo">Em uma frase: <b>{cena.frase}</b></p>}
        </div>)}
      <div className="intro-pe tres">
        <button className="sec" disabled={i === 0} onClick={() => ir_(i - 1)}>Voltar</button>
        {cena.seg > 0 ? <button className="sec" onClick={() => setPausado(p => !p)}>{pausado ? 'Continuar' : 'Pausar'}</button> : <span />}
        {ultimo ? <button className="primario" onClick={fechar}>Entendi</button> : <button className="primario" onClick={() => ir_(i + 1)}>Próximo</button>}
      </div>
      <p className="marca-i">{TEMA.nome}</p>
    </div>
  )
}
