import { avisar } from '../lib/mockStore'
import { useEffect, useState } from 'react'
import { useClube } from '../lib/clube'
import { celularEscondido, celularValido, mascaraCelular } from '../data/telefone'
import { DOCS } from '../data/legal'

/** Meu celular: o número é só da pessoa; o consentimento para mensagens do restaurante é opcional e pode ser tirado a qualquer hora. */
function MeuCelular() {
  const c = useClube(); const [atual, setAtual] = useState<{ phone: string; messaging: boolean } | null>(null); const [edit, setEdit] = useState(false)
  const [cel, setCel] = useState(''); const [msgs, setMsgs] = useState(false); const [busy, setBusy] = useState(false)
  useEffect(() => { c.contato().then(setAtual).catch(() => setAtual({ phone: '', messaging: false })) }, [edit]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!atual) return null
  const salvar = async (apagar = false) => { setBusy(true); try { await c.salvarContato(apagar ? '' : cel, apagar ? false : msgs); avisar(apagar ? 'Celular apagado.' : 'Celular salvo.'); setEdit(false) } catch { avisar('Não foi possível salvar. Confira o número.') } finally { setBusy(false) } }
  if (!edit) return <div className="bloco-c"><h2>Meu celular</h2>
    {atual.phone ? <p><b>{celularEscondido(atual.phone)}</b><br /><small>{atual.messaging ? 'Você aceita receber avisos e promoções deste restaurante.' : 'Você não recebe avisos e promoções.'}</small></p> : <p>Você ainda não informou o seu celular.</p>}
    <button className="sec" onClick={() => { setCel(atual.phone ? mascaraCelular(atual.phone) : ''); setMsgs(atual.messaging); setEdit(true) }}>{atual.phone ? 'Mudar celular ou avisos' : 'Informar celular'}</button></div>
  return <div className="bloco-c"><h2>Meu celular</h2>
    <label className="rot">Celular com DDD<input className="campo" type="tel" inputMode="tel" autoComplete="tel" value={cel} onChange={e => setCel(mascaraCelular(e.target.value))} placeholder="(11) 91234-5678" /></label>
    <label className="check"><input type="checkbox" checked={msgs} onChange={e => setMsgs(e.target.checked)} /><span>Quero receber avisos e promoções deste restaurante por WhatsApp ou SMS.</span></label>
    <div className="duas"><button className="primario" disabled={busy || !celularValido(cel)} onClick={() => salvar()}>Salvar</button><button className="sec" onClick={() => setEdit(false)}>Cancelar</button></div>
    {!!atual.phone && <button className="link apagar" disabled={busy} onClick={() => { if (window.confirm('Apagar o seu celular? Você deixa de receber avisos e promoções.')) void salvar(true) }}>Apagar meu celular</button>}</div>
}

/** Minha conta: quem sou, atalhos do Clube, documentos, sair e excluir. */
export function Conta({ ir }: { ir: (r: string) => void }) {
  const c = useClube(); const v = c.v
  if (!v) return <section className="tela-int"><p>Carregando…</p></section>
  if (!v.logado) return <section className="tela-int"><h1>Minha conta</h1><p>Entre para ver seus pontos e prêmios.</p><button className="primario grande" onClick={() => ir('/entrar')}>Entrar ou cadastrar</button></section>
  const nome = v.membro?.nome ?? v.email.split('@')[0]; const ini = nome.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase()
  const Linha = ({ t, s, ao }: { t: string; s?: string; ao: () => void }) => <button className="linha-conta" onClick={ao}><span><b>{t}</b>{s && <small>{s}</small>}</span><span aria-hidden="true">›</span></button>
  return (
    <section className="tela-int">
      <h1>Minha conta</h1>
      <div className="bloco-c cartao-conta"><span className="avatar">{ini}</span><div><b>{nome}</b><small>{v.email}</small>{v.membro && <small>{v.membro.saldo} pontos no Clube</small>}</div></div>
      {v.membro && <div className="bloco-c">
        <Linha t="Meu Clube" s="Pontos, prêmios e como ganhar" ao={() => ir('/clube')} /><Linha t="Meu extrato" s="Tudo que você ganhou e trocou" ao={() => ir('/clube/extrato')} />
        <Linha t="Indicar um amigo" s="Ganhe pontos quando ele fizer a primeira visita" ao={() => ir('/clube/indicar')} /></div>}
      {v.membro && <MeuCelular />}
      <div className="bloco-c">{DOCS.map(d => <Linha key={d.id} t={d.titulo} ao={() => ir('/' + d.id)} />)}</div>
      <button className="sec grande" onClick={async () => { await c.sair(); avisar('Você saiu da conta.'); ir('/') }}>Sair da conta</button>
      {v.membro && <button className="link apagar" onClick={async () => { if (!window.confirm('Excluir sua conta?\n\nSeus pontos, trocas, prêmios e dados serão apagados e não podem ser recuperados.')) return; try { await c.excluirConta(); avisar('Sua conta foi excluída.'); ir('/') } catch (e) { c.avisarErro(e) } }}>Excluir minha conta</button>}
    </section>
  )
}
