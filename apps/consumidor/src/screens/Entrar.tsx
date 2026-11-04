import { useState } from 'react'
import { avisar, entrar } from '../lib/mockStore'

/** Protótipo: a identificação é SIMULADA. Em produção será código por e-mail (Supabase Auth). */
export function Entrar({ ir, volta }: { ir: (r: string) => void; volta: string }) {
  const [email, setEmail] = useState(''); const [etapa, setEtapa] = useState<'email' | 'codigo'>('email'); const [cod, setCod] = useState('')
  const [aceite, setAceite] = useState(false); const [promo, setPromo] = useState(false)
  const emailOk = /^\S+@\S+\.\S+$/.test(email)
  return (
    <section className="tela-int">
      <h1>Entrar no clube</h1>
      <div className="aviso">Entrar é <b>opcional</b>. Você continua vendo o cardápio, montando a seleção e chamando o garçom sem conta. Entrar serve para <b>guardar pontos, resgatar prêmios, salvar favoritos em qualquer aparelho e comentar</b>.</div>
      {etapa === 'email' ? (
        <>
          <label className="rot">Seu e-mail<input className="campo" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" /></label>
          <label className="check"><input type="checkbox" checked={aceite} onChange={e => setAceite(e.target.checked)} /><span>Li e aceito os termos de uso e a política de privacidade <small>(textos ainda a redigir)</small></span></label>
          <label className="check"><input type="checkbox" checked={promo} onChange={e => setPromo(e.target.checked)} /><span>Quero receber novidades e promoções. <small>Opcional, e separado do aceite acima.</small></span></label>
          <button className="primario grande" disabled={!emailOk || !aceite} onClick={() => { setEtapa('codigo'); avisar('Protótipo: nenhum e-mail é enviado. Use qualquer código de 6 dígitos.') }}>Enviar código</button>
        </>
      ) : (
        <>
          <p>Enviamos um código para <b>{email}</b>. <button className="link" onClick={() => setEtapa('email')}>Trocar e-mail</button></p>
          <label className="rot">Código de 6 dígitos<input className="campo" inputMode="numeric" maxLength={6} value={cod} onChange={e => setCod(e.target.value.replace(/\D/g, ''))} placeholder="000000" /></label>
          <p className="nota">Protótipo: qualquer código de 6 dígitos serve.</p>
          <button className="primario grande" disabled={cod.length !== 6} onClick={() => { entrar(email); avisar('Você está identificado. O saldo de pontos é demonstrativo.'); ir(volta) }}>Confirmar e entrar</button>
        </>
      )}
      <button className="link" onClick={() => ir(volta)}>Continuar sem entrar</button>
    </section>
  )
}
