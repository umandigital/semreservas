import { TEMA } from '../data/tema'
import { DOCS } from '../data/legal'

export function Sobre({ ir }: { ir?: (r: string) => void }) {
  return (
    <section className="tela-int">
      <h1>Sobre</h1>
      <div className="cartao-i">
        <img className="logo-sr" src={import.meta.env.BASE_URL + TEMA.logo} alt={TEMA.nome} />
        <p><b>{TEMA.nome}</b></p>
        <p>Aproxime o celular da placa da sua mesa para ver o cardápio, chamar o garçom e participar do Clube.</p>
      </div>
      <div className="cartao-i">
        <img className="logo-sr" src={import.meta.env.BASE_URL + 'media/logo-oficial-horizontal.png'} alt="SemReservas" />
        <p><b>Marketing de relacionamento gastronômico</b></p>
        <p><i>{TEMA.slogan}</i></p>
        <p>Tecnologia SemReservas, criada pela Uman Digital.</p>
      </div>
      <div className="bloco-c"><h2>Documentos</h2>{DOCS.map(d => <button key={d.id} className="link" onClick={() => ir?.('/' + d.id)}>{d.titulo}</button>)}</div>
    </section>
  )
}
