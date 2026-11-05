import { useCallback, useEffect, useRef, useState } from 'react'
import { instalavel, instalar, jaInstalado, ehIos, registrarPwa } from '../lib/pwa'
import { ApiError, painelFila, painelInfo, painelMudar, ROTULO, type Pedido } from '../lib/api'

// Painel da equipe: abre pelo link, um toque para ativar e fica funcionando. Só serve para a fila.
const TOKEN_KEY = 'sr-painel'
const ICONE_NORMAL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%232a1148'/%3E%3C/svg%3E"
const ICONE_ALERTA = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23e5322d'/%3E%3C/svg%3E"

const lerToken = (url?: string) => { if (url) return url; try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
const mudarIcone = (href: string) => { let l = document.querySelector<HTMLLinkElement>('link[rel~=icon]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l) } l.href = href }

/** Relógio em Web Worker: não sofre a pausa que os navegadores aplicam a abas em segundo plano. */
function relogio(cb: () => void): () => void {
  try {
    const w = new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(1),1000)'], { type: 'text/javascript' })))
    w.onmessage = cb; return () => w.terminate()
  } catch { const t = setInterval(cb, 1000); return () => clearInterval(t) }
}

export function Equipe({ tokenUrl }: { tokenUrl?: string }) {
  const token = lerToken(tokenUrl)
  const [fase, setFase] = useState<'validando' | 'invalido' | 'splash' | 'ativo'>('validando')
  const [nome, setNome] = useState(''); const [fila, setFila] = useState<Pedido[]>([]); const [offset, setOffset] = useState(0)
  const [conectado, setConectado] = useState(true); const [agora, setAgora] = useState(Date.now()); const [notif, setNotif] = useState('')
  const ctx = useRef<AudioContext | null>(null); const lock = useRef<{ release(): Promise<void> } | null>(null)
  const pend = useRef(0); const ultimoOk = useRef(Date.now()); const avisados = useRef(new Set<string>()); const titulo = useRef(document.title)

  useEffect(() => { if (token) registrarPwa(token) }, [token])
  const [podeInstalar, setPodeInstalar] = useState(false)
  useEffect(() => instalavel(setPodeInstalar), [])
  useEffect(() => {
    if (!token) return setFase('invalido')
    painelInfo(token).then(i => { setNome(i.tenant_name); setFase('splash'); try { localStorage.setItem(TOKEN_KEY, token) } catch { /* ignora */ } })
      .catch(e => setFase(e instanceof ApiError && e.code === 'invalid_token' ? 'invalido' : 'splash'))
  }, [token])

  const atualizar = useCallback(async () => {
    if (!token) return
    try {
      const l = await painelFila(token)
      ultimoOk.current = Date.now(); setConectado(true); setFila(l)
      if (l[0]) setOffset(Date.parse(l[0].server_now) - Date.now())
      pend.current = l.filter(p => p.status === 'PENDING').length
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        for (const p of l) if (p.status === 'PENDING' && !avisados.current.has(p.id)) {
          avisados.current.add(p.id)
          try { new Notification(`Mesa ${p.table_label} · ${p.detail ?? ROTULO[p.kind]}`, { tag: p.id, requireInteraction: true, body: 'Chamado aguardando a equipe' }) } catch { /* ignora */ }
        }
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'invalid_token') return setFase('invalido')
      if (Date.now() - ultimoOk.current > 8000) setConectado(false)
    }
  }, [token])

  const bip = (grave = false) => {
    const c = ctx.current; if (!c || c.state !== 'running') return
    const t0 = c.currentTime
    for (const [i, f] of (grave ? [330, 262] : [988, 1319]).entries()) {
      const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.type = 'square'
      g.gain.setValueAtTime(0.4, t0 + i * 0.22); g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.22 + 0.2)
      o.connect(g); g.connect(c.destination); o.start(t0 + i * 0.22); o.stop(t0 + i * 0.22 + 0.21)
    }
    navigator.vibrate?.([200, 100, 200])
  }

  // um tique por segundo: atualiza a tela, pisca o título, toca o sinal e consulta o banco a cada 3 s
  useEffect(() => {
    if (fase !== 'ativo') return
    let n = 0; atualizar()
    const parar = relogio(() => {
      n++; setAgora(Date.now())
      if (n % 3 === 0) atualizar()
      const offline = Date.now() - ultimoOk.current > 8000
      if (pend.current > 0) {
        const alerta = n % 2 === 0
        document.title = alerta ? `🔴 ${pend.current} CHAMADO${pend.current > 1 ? 'S' : ''}!` : '⚠️ ATENDER · SemReservas'
        mudarIcone(alerta ? ICONE_ALERTA : ICONE_NORMAL)
        if (n % 3 === 0) bip()
      } else if (offline) { document.title = '⚠️ SEM CONEXÃO'; if (n % 10 === 0) bip(true) }
      else { document.title = titulo.current; mudarIcone(ICONE_NORMAL) }
    })
    const vis = () => { if (!document.hidden) { atualizar(); pedirTela() } }
    document.addEventListener('visibilitychange', vis)
    return () => { parar(); document.removeEventListener('visibilitychange', vis); document.title = titulo.current }
  }, [fase, atualizar])

  async function pedirTela() { try { lock.current = await (navigator as unknown as { wakeLock?: { request(t: string): Promise<{ release(): Promise<void> }> } }).wakeLock?.request('screen') ?? null } catch { /* sem suporte */ } }
  async function iniciar() {
    const c = ctx.current ?? new AudioContext(); ctx.current = c; await c.resume()
    // som quase inaudível e contínuo: mantém a aba "viva" quando minimizada
    const o = c.createOscillator(), g = c.createGain(); g.gain.value = 0.0001; o.frequency.value = 40; o.connect(g); g.connect(c.destination); o.start()
    bip()   // confirma que o som funciona
    await pedirTela()
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') { try { setNotif(await Notification.requestPermission()) } catch { /* ignora */ } }
    setFase('ativo')
  }
  const agoraMs = agora + offset
  const minutos = (iso: string) => { const m = Math.floor((agoraMs - Date.parse(iso)) / 60000); return m < 1 ? 'agora' : `${m} min` }

  if (fase === 'validando') return <main className="centro"><p>Carregando…</p></main>
  if (fase === 'invalido') return <main className="centro"><h1>Link inválido</h1><p>Este link do painel não está ativo. Peça um novo ao SemReservas.</p></main>
  if (fase === 'splash') return (
    <main className="splash">
      <h1>{nome}</h1><p>Painel de atendimento</p>
      <button className="primario grande" onClick={iniciar}>Toque para iniciar</button>
      <p className="nota">Um toque ativa o som e mantém a tela acesa. Deixe esta tela aberta, mesmo minimizada.</p>
      {!jaInstalado() && podeInstalar && <button className="sec grande" onClick={() => instalar()}>Instalar o painel neste aparelho</button>}
      {!jaInstalado() && ehIos() && <p className="nota">Para instalar no iPhone/iPad: toque em Compartilhar e em "Adicionar à Tela de Início".</p>}
    </main>
  )
  const abertos = fila, pendentes = abertos.filter(p => p.status === 'PENDING').length
  return (
    <section className="equipe">
      <header><b>{nome}</b><span className={'estado' + (conectado ? ' ok' : ' off')}>{conectado ? 'Conectado' : 'SEM CONEXÃO'}</span></header>
      {!conectado && <div className="banner-alerta" role="alert">SEM CONEXÃO. Chamados podem não chegar. Verifique a internet.</div>}
      {conectado && pendentes > 0 && <div className="banner-alerta" role="alert">{pendentes === 1 ? '1 CHAMADO AGUARDANDO' : `${pendentes} CHAMADOS AGUARDANDO`}</div>}
      {conectado && pendentes === 0 && abertos.length === 0 && <p className="vazio">Nenhum chamado. Tudo em dia.</p>}
      <ul className="fila">{abertos.map(p => (
        <li key={p.id} className={p.status === 'PENDING' ? 'novo' : ''}>
          <div className="mesa-xl">Mesa {p.table_label}</div>
          <div className="linha"><b className="oque">{p.detail ?? ROTULO[p.kind]}</b><span>{minutos(p.created_at)}</span></div>
          {p.status === 'PENDING'
            ? <button className="primario grande" onClick={async () => { await painelMudar(token!, p.id, 'ACKNOWLEDGED').catch(() => false); atualizar() }}>Assumir</button>
            : <button className="sec grande" onClick={async () => { await painelMudar(token!, p.id, 'RESOLVED').catch(() => false); atualizar() }}>Concluir</button>}
        </li>))}</ul>
      <p className="nota">{notif === 'denied' ? 'Notificações bloqueadas no navegador. O som e o piscar continuam.' : 'Deixe esta tela aberta. Ela avisa com som e piscando.'}</p>
      <button className="link" onClick={() => bip()}>Testar som</button>
    </section>
  )
}
