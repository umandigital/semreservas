import { useEffect, useState } from 'react'
import { CLUBE, textoLimite, type Grupo } from '../data/clube'
import { avisar } from '../lib/mockStore'
import { useClube } from '../lib/clube'
import { IconCartao, IconCheck } from '../ui/Icons'
import { INTRO_KEY, IntroClube } from './IntroClube'

type Ir = { ir: (r: string) => void }
const dataBR = (t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** Clube em 4 blocos: seus pontos, prêmios, como ganhar, extrato. */
export function Clube({ ir }: Ir) {
  const c = useClube(); const v = c.v; const [intro, setIntro] = useState(false)
  useEffect(() => { if (v?.logado && !v.membro) ir('/cadastro') }, [v?.logado, v?.membro])
  // primeira vez no Clube (só quem é do Clube): abre a introdução; fechou ou viu, não abre de novo sozinha
  useEffect(() => { if (v?.membro) { try { if (!localStorage.getItem(INTRO_KEY + ':' + v.email)) setIntro(true) } catch { /* ignora */ } } }, [v?.membro?.nome])
  const fecharIntro = () => { try { if (v) localStorage.setItem(INTRO_KEY + ':' + v.email, '1') } catch { /* ignora */ } setIntro(false) }
  if (!v) return <section className="tela-int"><p>Carregando…</p></section>
  const m = v.membro
  const proximo = v.premios.find(p => !m || p.custo > m.saldo)
  const trocar = async (id: string) => { try { ir('/troca/' + await c.trocar(id)) } catch (e) { c.avisarErro(e) } }
  return (
    <section className="tela-int clube">
      {intro && <IntroClube fechar={fecharIntro} ir={ir} />}
      <h1>{CLUBE.nome}</h1>
      {!m ? (
        <div className="bloco-c"><h2>Entre e ganhe pontos</h2><p>Cada visita e cada ação no app dão pontos. Troque por sorvete, bebida, desconto e pizza.</p>
          <button className="primario grande" onClick={() => ir('/entrar')}>Entrar ou cadastrar</button>
          <p className="nota">Sem cadastro você usa o cardápio e chama o garçom normalmente.</p></div>
      ) : (
        <div className="bloco-c pontos"><small>Seus pontos</small><b>{m.saldo}</b>
          <div className="marcos" aria-hidden="true"><i style={{ width: `${Math.min(100, (m.saldo / (v.premios[v.premios.length - 1]?.custo || 1000)) * 100)}%` }} />
            {v.premios.map(p => <u key={p.id} style={{ left: `${(p.custo / (v.premios[v.premios.length - 1]?.custo || 1000)) * 100}%` }} />)}</div>
          <p>{proximo ? `Faltam ${Math.max(0, proximo.custo - m.saldo)} pontos para ${proximo.nome.split(' (')[0]}.` : 'Você já pode trocar qualquer prêmio.'}</p></div>
      )}
      <div className="bloco-c"><h2>Prêmios</h2>
        <ul className="premios">{v.premios.map(p => {
          const pode = !!m && m.saldo >= p.custo && m.visitas >= p.minVisitas
          return <li key={p.id}><span><b>{p.nome}</b><small>{p.custo} pontos{p.minVisitas ? ` · precisa de ${p.minVisitas} visitas` : ''}</small></span>
            {pode ? <button className="primario" onClick={() => trocar(p.id)}>Trocar</button> : <span className="falta">{m ? `faltam ${Math.max(0, p.custo - m.saldo)}` : ''}</span>}</li>
        })}</ul></div>
      <button className="sec grande" onClick={() => ir('/clube/ganhar')}>Como ganhar pontos</button>
      {m && <button className="link" onClick={() => setIntro(true)}>Como o Clube funciona</button>}
      {m && <button className="sec grande" onClick={() => ir('/clube/indicar')}>Indicar um amigo</button>}
      {m && <div className="links-c"><button className="link" onClick={() => ir('/clube/extrato')}>Meu extrato</button><button className="link" onClick={async () => { await c.sair(); avisar('Você saiu do Clube.') }}>Sair</button></div>}
    </section>
  )
}

/** Lista completa de todas as formas de ganhar pontos (montada pelas regras ligadas do restaurante). */
export function ClubeGanhar({ ir }: Ir) {
  const c = useClube(); const [aberto, setAberto] = useState<string | null>('visita')
  const regras = (c.v?.regras ?? []).filter(r => r.points > 0)
  const grupos = Object.keys(CLUBE.grupos).filter(g => regras.some(r => r.grupo === g)) as Grupo[]
  return (
    <section className="tela-int">
      <button className="link" onClick={() => ir('/clube')}>← Clube</button>
      <h1>Como ganhar pontos</h1>
      <p className="nota">Os valores mostrados são os do restaurante e podem mudar.</p>
      {grupos.map(g => (
        <div key={g} className="bloco-c">
          <button className="grupo-t" aria-expanded={aberto === g} onClick={() => setAberto(aberto === g ? null : g)}><b>{CLUBE.grupos[g]}</b><span>{aberto === g ? '–' : '+'}</span></button>
          {aberto === g && <ul className="premios">{regras.filter(r => r.grupo === g).map(r => <li key={r.action}><span><b>{r.rotulo}</b><small>{textoLimite(r)}</small></span><b className="pts">+{r.points}</b></li>)}</ul>}
        </div>))}
      <p className="nota">Ações de uma vez só valem uma vez. Algumas têm limite por dia, semana ou mês, e as interações do app somam no máximo {CLUBE.tetoMensal} pontos por mês.</p>
    </section>
  )
}

export function Extrato({ ir }: Ir) {
  const c = useClube(); const l = c.v?.extrato ?? []
  const nome = (a: string) => ({ redeem: 'Troca de prêmio', redeem_cancel: 'Troca cancelada', manual_adjust: 'Ajuste do restaurante' } as Record<string, string>)[a] ?? CLUBE_ROT[a] ?? a
  return (
    <section className="tela-int">
      <button className="link" onClick={() => ir('/clube')}>← Clube</button>
      <h1>Meu extrato</h1>
      {c.v?.membro && <p>Total ganho: <b>{c.v.membro.total} pontos</b></p>}
      {l.length === 0 ? <p className="vazio">Nada por aqui ainda.</p> : <ul className="premios">{l.map((x, i) => <li key={i}><span><b>{nome(x.action)}</b><small>{dataBR(x.em)}</small></span><b className={x.delta > 0 ? 'pts' : 'neg'}>{x.delta > 0 ? '+' : ''}{x.delta}</b></li>)}</ul>}
    </section>
  )
}
import { REGRAS } from '../data/clube'
const CLUBE_ROT: Record<string, string> = Object.fromEntries(REGRAS.map(r => [r.action, r.rotulo]))

/** Comprovante da troca: tela "de papel" (creme) para mostrar ao garçom. */
export function Troca({ id, ir }: { id: string } & Ir) {
  const c = useClube(); const t = c.v?.trocas.find(x => x.id === id); const [agora, setAgora] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(i) }, [])
  if (!c.v) return <section className="tela-int"><p>Carregando…</p></section>
  if (!t) return <section className="tela-int"><h1>Troca não encontrada</h1><button className="primario grande" onClick={() => ir('/clube')}>Voltar ao Clube</button></section>
  const resta = Math.max(0, Math.floor((t.expira - agora) / 1000)); const cancelavel = t.status === 'active' && agora < t.em + CLUBE.cancelarSeg * 1000
  const mm = String(Math.floor(resta / 60)).padStart(2, '0'), ss = String(resta % 60).padStart(2, '0')
  return (
    <section className="tela-int">
      <div className="papel">
        <p className={'selo-t ' + (t.status === 'active' ? 'ok' : 'off')}><IconCheck /> {t.status === 'active' ? 'Troca realizada' : 'Troca cancelada'}</p>
        <h1>{t.nome}</h1>
        <p>Código do comprovante</p><b className="cod-g">{t.code}</b>
        {t.status === 'active' && <p className="valido">{resta > 0 ? <>Mostre em até <b>{mm}:{ss}</b></> : 'Comprovante vencido. A troca continua registrada.'}</p>}
        <p className="nota-p">Mostre esta tela ao garçom.</p>
      </div>
      {cancelavel && <button className="sec grande" onClick={async () => { try { await c.cancelar(t.id); avisar('Troca cancelada. Seus pontos voltaram.') } catch (e) { c.avisarErro(e) } }}>Cancelar a troca (até 2 minutos)</button>}
      <button className="primario grande" onClick={() => ir('/clube')}><IconCartao /> Voltar ao Clube</button>
    </section>
  )
}

/** Indicar um amigo: código e link. Quem indicou ganha quando o amigo se cadastra e faz a primeira visita. */
export function Indicar({ ir }: Ir) {
  const c = useClube(); const m = c.v?.membro; const pts = c.v?.regras.find(r => r.action === 'referral')?.points ?? 0
  const link = `${location.origin}${import.meta.env.BASE_URL}?ref=${m?.ref ?? ''}`
  const texto = `Venha para o ${CLUBE.nome}! Use meu código ${m?.ref} e ganhe pontos: ${link}`
  const compartilhar = async () => { try { if (navigator.share) { await navigator.share({ text: texto }); return } } catch { return } window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener') }
  if (!m) return <section className="tela-int"><h1>Indicar um amigo</h1><button className="primario grande" onClick={() => ir('/entrar')}>Entrar ou cadastrar</button></section>
  return (
    <section className="tela-int">
      <button className="link" onClick={() => ir('/clube')}>← Clube</button>
      <h1>Indicar um amigo</h1>
      <p>Quando seu amigo se cadastrar e fizer a primeira visita, você ganha <b>+{pts} pontos</b>.</p>
      <div className="bloco-c"><small>Seu código</small><b className="cod-g claro">{m.ref}</b>
        <button className="sec" onClick={async () => { try { await navigator.clipboard.writeText(m.ref); avisar('Código copiado.') } catch { avisar('Copie o código manualmente.') } }}>Copiar código</button></div>
      <button className="primario grande" onClick={compartilhar}>Enviar pelo WhatsApp</button>
    </section>
  )
}
