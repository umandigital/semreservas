import { useState, type ReactNode } from 'react'
import { CONFIG } from '../data/cardapio'
import { avisar, criarChamado, sair, useMembro } from '../lib/mockStore'
import { getMesa } from '../lib/router'
import { IconCamera, IconCardapio, IconCompartilhar, IconConta, IconEstrela, IconInfo, IconInsta, IconPesquisa, IconPrancheta, IconPresente, IconSino, IconWifi } from '../ui/Icons'

const Atalho = ({ icone, t, onClick, forte }: { icone: ReactNode; t: string; onClick: () => void; forte?: boolean }) =>
  <button className={'acao' + (forte ? ' forte' : '')} onClick={onClick}>{icone}<span>{t}</span></button>

/** Todas as ações do cliente, em grupos. Usada na Home e na tela Serviços. */
export function Acoes({ ir }: { ir: (r: string) => void }) {
  const [wifi, setWifi] = useState(false); const [copiado, setCopiado] = useState(false)
  const copiar = async () => { try { await navigator.clipboard.writeText(CONFIG.wifi.senha); setCopiado(true); avisar('Senha copiada. Abra os Ajustes de Wi-Fi do aparelho.') } catch { avisar('Copie a senha manualmente.') } }
  const conta = () => {
    const mesa = getMesa(); if (!mesa) return ir('/chamar')
    const c = criarChamado(mesa, 'Conta'); ir('/chamado/' + c.id)
  }
  const externo = (o: string) => avisar(`Simulação: abriria o ${o} do estabelecimento. O link real ainda não foi configurado. Clicar não comprova curtida nem avaliação.`)
  const compartilhar = async () => {
    const url = location.href.split('#')[0]
    try { if (navigator.share) { await navigator.share({ title: 'SemReservas GastroPub', url }); return } } catch { return }
    try { await navigator.clipboard.writeText(url); avisar('Link do cardápio copiado.') } catch { avisar('Copie o endereço da barra do navegador.') }
  }
  return (
    <>
      <h2 className="sub">O que deseja fazer?</h2>
      <div className="acoes">
        <Atalho forte icone={<IconCardapio />} t="Ver cardápio" onClick={() => ir('/cardapio')} />
        <Atalho icone={<IconPrancheta />} t="Minha seleção" onClick={() => ir('/pedido')} />
        <Atalho icone={<IconPresente />} t="Clube e prêmios" onClick={() => ir('/clube')} />
        <Atalho icone={<IconSino />} t="Chamar garçom" onClick={() => ir('/chamar')} />
      </div>
      <h2 className="sub">Conecte-se</h2>
      <div className="acoes">
        <Atalho icone={<IconInsta />} t="Instagram" onClick={() => externo('Instagram')} />
        <Atalho icone={<IconEstrela />} t="Avaliar no Google" onClick={() => externo('formulário de avaliação do Google')} />
        <Atalho icone={<IconWifi />} t="Conectar ao Wi-Fi" onClick={() => setWifi(!wifi)} />
        <Atalho icone={<IconConta />} t="Pedir a conta" onClick={conta} />
      </div>
      {wifi && <div className="wifi"><p>Rede: <b>{CONFIG.wifi.ssid}</b></p><p>Senha: <b>{CONFIG.wifi.senha}</b></p>
        <button className="sec" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar senha'}</button>
        <p className="nota">O site não conecta o celular sozinho. Abra Ajustes → Wi-Fi e escolha a rede.</p></div>}
      <h2 className="sub">Sua experiência</h2>
      <div className="acoes">
        <Atalho icone={<IconCamera />} t="Fotos e molduras" onClick={() => ir('/fotos')} />
        <Atalho icone={<IconPesquisa />} t="Pesquisa rápida" onClick={() => ir('/pesquisa')} />
        <Atalho icone={<IconCompartilhar />} t="Compartilhar o cardápio" onClick={compartilhar} />
        <Atalho icone={<IconInfo />} t="Contato SemReservas" onClick={() => ir('/contato')} />
      </div>
    </>
  )
}

export function Home({ nome, ir }: { nome: string; ir: (r: string) => void }) {
  const mesa = getMesa(); const m = useMembro()
  return (
    <section className="home">
      <div className="hero"><h1>{nome}</h1>{mesa && <p className="mesa-g">Você está na Mesa {mesa}</p>}</div>
      {!m ? (
        <div className="banner-login"><p>Navegue livremente, sem cadastro. <b>Entrar é opcional</b> e libera saldo, resgate de pontos, favoritos em qualquer aparelho e comentários.</p>
          <button className="sec" onClick={() => ir('/entrar?de=/')}>Entrar para meus pontos</button></div>
      ) : (
        <div className="banner-login ident"><p>Identificado como <b>{m.email}</b> · {m.pontos} pontos (demonstrativo)</p>
          <button className="sec" onClick={() => { sair(); avisar('Voltou à navegação sem cadastro.') }}>Sair</button></div>
      )}
      <Acoes ir={ir} />
      <p className="rodape-sr"><img src={import.meta.env.BASE_URL + 'media/logo-oficial-horizontal.png'} alt="SemReservas" /> Tecnologia SemReservas</p>
    </section>
  )
}
