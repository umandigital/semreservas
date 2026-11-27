import { TEMA } from '../data/tema'
import { useState } from 'react'
import { CONFIG } from '../data/cardapio'
import { DOCS } from '../data/legal'
import { avisar } from '../lib/mockStore'
import { IconWifi } from '../ui/Icons'

export function Sobre({ ir }: { ir?: (r: string) => void }) {
  const [wifi, setWifi] = useState(false); const [copiado, setCopiado] = useState(false)
  const copiar = async () => { try { await navigator.clipboard.writeText(CONFIG.wifi.senha); setCopiado(true); avisar('Senha copiada. Abra os Ajustes de Wi-Fi do aparelho.') } catch { avisar('Copie a senha manualmente.') } }
  return (
    <section className="tela-int">
      <h1>Sobre</h1>
      <button className="sec grande" onClick={() => ir?.('/conta')}>Minha conta</button>
      <button className="sec grande" onClick={() => setWifi(!wifi)} aria-expanded={wifi}><IconWifi /> Wi-Fi do restaurante</button>
      {wifi && <div className="cartao-i"><p>Rede: <b>{CONFIG.wifi.ssid}</b></p><p>Senha: <b>{CONFIG.wifi.senha}</b></p><button className="sec" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar senha'}</button><p className="nota">O site não conecta o celular sozinho. Abra Ajustes e escolha a rede.</p></div>}
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
