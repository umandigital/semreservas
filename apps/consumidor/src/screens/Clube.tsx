import { avisar, resgatar, sair, useMembro } from '../lib/mockStore'

const PREMIOS = [{ nome: 'Drink especial', custo: 500 }, { nome: 'Sobremesa', custo: 800 }, { nome: 'Benefício garantido', custo: 1200 }]

export function Clube({ ir }: { ir: (r: string) => void }) {
  const m = useMembro()
  return (
    <section className="tela-int">
      <h1>Clube e prêmios</h1>
      {!m ? (
        <div className="cartao-i"><h2>Seus benefícios começam aqui</h2>
          <p>Você pode navegar pelo cardápio sem conta. Para guardar pontos e resgatar prêmios, precisamos identificar o participante.</p>
          <button className="primario grande" onClick={() => ir('/entrar?de=/clube')}>Entrar para meus pontos</button></div>
      ) : (
        <div className="cartao-i saldo"><small>Seu saldo (demonstrativo)</small><b>{m.pontos} pontos</b><small>{m.email}</small>
          <div className="barra-p" aria-hidden="true"><i style={{ width: `${Math.min(100, (m.pontos / 500) * 100)}%` }} /></div>
          <button className="link" onClick={() => { sair(); avisar('Você saiu. Voltou à navegação sem cadastro.') }}>Sair</button></div>
      )}
      <div className="cartao-i"><h2>Como ganhar pontos</h2><p>Compras validadas pela equipe, pesquisas internas elegíveis e atividades previstas no regulamento. <b>Aproximar o celular da placa não gera pontos.</b></p></div>
      <div className="cartao-i"><h2>Prêmios</h2>
        <ul className="premios">{PREMIOS.map(p => (
          <li key={p.nome}><span><b>{p.nome}</b><small>{p.custo} pts</small></span>
            {!m ? <button className="sec" onClick={() => ir('/entrar?de=/clube')}>Entrar</button>
              : m.pontos >= p.custo ? <button className="primario" onClick={() => { const c = resgatar(p.nome, p.custo); avisar(c ? `Resgate pedido. Mostre o código ${c} ao garçom.` : 'Saldo insuficiente.') }}>Resgatar</button>
              : <span className="falta">faltam {p.custo - m.pontos}</span>}</li>))}</ul>
        <p className="nota">Protótipo: pontos e resgates não são reais. Em produção, o crédito só existe depois de validado pela equipe ou pelo servidor.</p></div>
      {m && m.resgates.length > 0 && <div className="cartao-i"><h2>Meus resgates</h2><ul className="premios">{m.resgates.map(r => <li key={r.code}><span><b>{r.premio}</b><small>código {r.code}</small></span></li>)}</ul></div>}
      <p className="nota">Não damos pontos nem vantagem por avaliações no Google.</p>
    </section>
  )
}
