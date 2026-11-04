import { useState } from 'react'
import { CONFIG } from '../data/cardapio'
import { getMesa } from '../lib/router'
import { IconCardapio, IconEstrela, IconInsta, IconPrancheta, IconSino, IconWifi } from '../ui/Icons'

export function Home({ nome, ir }: { nome: string; ir: (r: string) => void }) {
  const mesa = getMesa(); const [wifi, setWifi] = useState(false); const [copiado, setCopiado] = useState(false)
  const copiar = async () => { try { await navigator.clipboard.writeText(CONFIG.wifi.senha); setCopiado(true) } catch { setCopiado(false) } }
  return (
    <section className="home">
      <div className="hero"><h1>{nome}</h1>{mesa && <p className="mesa-g">Você está na Mesa {mesa}</p>}</div>
      <div className="acoes">
        <button className="acao forte" onClick={() => ir('/cardapio')}><IconCardapio /><span>Ver cardápio</span></button>
        <button className="acao" onClick={() => ir('/pedido')}><IconPrancheta /><span>Minha seleção</span></button>
        <button className="acao" onClick={() => ir('/chamar')}><IconSino /><span>Chamar garçom</span></button>
      </div>
      <h2 className="sub">Conecte-se</h2>
      <div className="conecte">
        <button className="peq" onClick={() => setWifi(!wifi)} aria-expanded={wifi}><IconWifi /> Wi-Fi</button>
        {CONFIG.instagram && <a className="peq" href={CONFIG.instagram} target="_blank" rel="noopener noreferrer"><IconInsta /> Instagram</a>}
        {CONFIG.googleAvaliacao && <a className="peq" href={CONFIG.googleAvaliacao} target="_blank" rel="noopener noreferrer"><IconEstrela /> Avaliar no Google</a>}
      </div>
      {wifi && <div className="wifi"><p>Rede: <b>{CONFIG.wifi.ssid}</b></p><p>Senha: <b>{CONFIG.wifi.senha}</b></p>
        <button className="sec" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar senha'}</button>
        <p className="nota">Conecte pelos Ajustes do celular, em Wi-Fi.</p></div>}
    </section>
  )
}
