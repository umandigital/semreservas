import { celularValido, mascaraCelular } from '../data/telefone'
import { useEffect, useState } from 'react'
import { CLUBE } from '../data/clube'
import { avisar } from '../lib/mockStore'
import { CLUBE_REAL, useClube, textoErro } from '../lib/clube'
import { IconCartao } from '../ui/Icons'
import { Legal } from './Legal'

/** Entrada em 3 passos: escolher (Google ou e-mail), código e, na tela seguinte, "Falta só um passo". */
export function Entrar({ ir, volta }: { ir: (r: string) => void; volta: string }) {
  const c = useClube(); const [etapa, setEtapa] = useState<'escolher' | 'email' | 'codigo'>('escolher'); const [email, setEmail] = useState(''); const [cod, setCod] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { if (c.v?.logado) ir(c.v.membro ? volta : '/cadastro') }, [c.v?.logado, c.v?.membro])
  const emailOk = /^\S+@\S+\.\S+$/.test(email)
  const go = async (f: () => Promise<unknown>) => { setBusy(true); try { await f() } catch (e) { avisar(textoErro(e)) } finally { setBusy(false) } }
  return (
    <section className="tela-int entrar">
      <h1>Entre no Clube</h1>
      <p>{CLUBE.nome}: ganhe pontos a cada visita e troque por prêmios.</p>
      {etapa === 'escolher' && <>
        {(!CLUBE_REAL || import.meta.env.VITE_GOOGLE_LOGIN === '1') && <button className="sec grande" disabled={busy} onClick={() => go(c.entrarGoogle)}>Continuar com Google</button>}
        {(!CLUBE_REAL || import.meta.env.VITE_EMAIL_LOGIN === '1') && <button className="sec grande" onClick={() => setEtapa('email')}>Continuar com e-mail</button>}
        <p className="nota">Seu cadastro leva só um instante.</p></>}
      {etapa === 'email' && <>
        <label className="rot">Seu e-mail<input className="campo" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" /></label>
        <button className="primario grande" disabled={!emailOk || busy} onClick={() => go(async () => { await c.enviarCodigo(email.trim()); setEtapa('codigo') })}>Receber código</button></>}
      {etapa === 'codigo' && <>
        <p>Enviamos um código para <b>{email}</b>.</p>
        <label className="rot">Código de 6 dígitos<input className="campo" inputMode="numeric" maxLength={6} value={cod} onChange={e => setCod(e.target.value.replace(/\D/g, ''))} placeholder="000000" /></label>
        {!CLUBE_REAL && <p className="nota">Simulação: qualquer código de 6 dígitos serve.</p>}
        <button className="primario grande" disabled={cod.length !== 6 || busy} onClick={() => go(() => c.confirmarCodigo(email.trim(), cod))}>Confirmar e entrar</button></>}
      <button className="link" onClick={() => ir(volta)}><IconCartao /> Continuar sem entrar</button>
    </section>
  )
}

/** "Falta só um passo": nome, aniversário e aceite. Depois vai para o Início. */
export function Cadastro({ ir }: { ir: (r: string) => void }) {
  const c = useClube(); const v = c.v
  const [lei, setLei] = useState<string | null>(null)
  const [nome, setNome] = useState(''); const [d, setD] = useState(''); const [m, setM] = useState(''); const [a, setA] = useState(''); const [aceite, setAceite] = useState(false); const [pub, setPub] = useState(false); const [cel, setCel] = useState(''); const [msgs, setMsgs] = useState(false); const [busy, setBusy] = useState(false)
  useEffect(() => { if (v && !v.logado) ir('/entrar'); if (v?.membro) ir('/') }, [v?.logado, v?.membro])
  useEffect(() => { if (v?.email && !nome) setNome(v.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, x => x.toUpperCase())) }, [v?.email])
  const nasc = `${a.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  const ok = nome.trim().length >= 2 && d && m && a.length === 4 && !isNaN(Date.parse(nasc)) && aceite && celularValido(cel)
  return (
    <section className="tela-int entrar">
      {lei && <Legal id={lei} fechar={() => setLei(null)} />}
      <h1>Falta só um passo</h1>
      <p>Complete seu cadastro para entrar no {CLUBE.nome}.</p>
      <div className="bloco-c"><p className="conta">Conta: <b>{v?.email}</b> ✓</p>
        <label className="rot">Seu nome<input className="campo" value={nome} onChange={e => setNome(e.target.value)} maxLength={80} autoComplete="name" /></label></div>
      <div className="bloco-c"><h2>Seu aniversário</h2>
        <div className="tres"><label className="rot">Dia<input className="campo" inputMode="numeric" maxLength={2} value={d} onChange={e => setD(e.target.value.replace(/\D/g, ''))} placeholder="14" /></label>
          <label className="rot">Mês<input className="campo" inputMode="numeric" maxLength={2} value={m} onChange={e => setM(e.target.value.replace(/\D/g, ''))} placeholder="08" /></label>
          <label className="rot">Ano<input className="campo" inputMode="numeric" maxLength={4} value={a} onChange={e => setA(e.target.value.replace(/\D/g, ''))} placeholder="1985" /></label></div>
        <p className="nota">É para o seu presente de aniversário. Depois de salvo, só o atendimento pode mudar.</p></div>
      <div className="bloco-c"><h2>Seu celular</h2>
        <label className="rot">Celular com DDD<input className="campo" type="tel" inputMode="tel" autoComplete="tel" value={cel} onChange={e => setCel(mascaraCelular(e.target.value))} placeholder="(11) 91234-5678" aria-invalid={!!cel && !celularValido(cel)} /></label>
        {!!cel && !celularValido(cel) && <p className="alerta" role="alert">Confira o número: DDD e 9 dígitos.</p>}
        <p className="nota">Só você e o atendimento do Clube usam este número, para falar sobre o seu cadastro e os seus prêmios.</p>
        <label className="check"><input type="checkbox" checked={msgs} onChange={e => setMsgs(e.target.checked)} /><span>Quero receber avisos e promoções deste restaurante por WhatsApp ou SMS. <small>Opcional. Você desiste quando quiser em Minha conta.</small></span></label></div>
      <label className="check"><input type="checkbox" checked={aceite} onChange={e => setAceite(e.target.checked)} /><span>Li e aceito o <button type="button" className="link" onClick={() => setLei('regulamento')}>regulamento do Clube</button>, os <button type="button" className="link" onClick={() => setLei('termos')}>termos de uso</button> e a <button type="button" className="link" onClick={() => setLei('privacidade')}>política de privacidade</button>.</span></label>
      <label className="check"><input type="checkbox" checked={pub} onChange={e => setPub(e.target.checked)} /><span>Aceito que o restaurante divulgue meu nome se eu for cliente do mês. <small>Opcional.</small></span></label>
      <button className="primario grande" disabled={!ok || busy} onClick={async () => { setBusy(true); try { await c.cadastrar(nome, nasc, pub, cel, msgs); avisar('Cadastro concluído! Você ganhou 50 pontos.'); ir('/') } catch (e) { avisar(textoErro(e)) } finally { setBusy(false) } }}>Concluir cadastro</button>
      <p className="nota">Você ganha 50 pontos ao concluir.</p>
    </section>
  )
}
