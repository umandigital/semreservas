import { useState, type ReactNode } from 'react'
import { CONFIG } from '../data/cardapio'
import { TEMA } from '../data/tema'
import { avisar, useSelecao } from '../lib/mockStore'
import { useClube } from '../lib/clube'
import { ApiError, MENSAGEM_ERRO } from '../lib/api'
import { pedirAtendimento } from '../lib/atendimento'
import { getMesa, getToken } from '../lib/router'
import { IconCamera, IconCardapio, IconCartao, IconCubo, IconPresente, IconConta, IconEstrela, IconInsta, IconPesquisa, IconPrancheta, IconWifi } from '../ui/Icons'

const Servico = ({ icone, t, onClick }: { icone: ReactNode; t: string; onClick: () => void }) =>
  <button className="servico" onClick={onClick}>{icone}<span>{t}</span></button>

/** Início em 4 blocos: (1) cabeçalho, (2) Ver cardápio, (3) Meu pedido e Clube, (4) Serviços. */
export function Home({ nome, ir }: { nome: string; ir: (r: string) => void }) {
  const mesa = getMesa(); const clube = useClube(); const cv = clube.v; const m = cv?.membro; const sel = useSelecao()
  const [wifi, setWifi] = useState(false); const [copiado, setCopiado] = useState(false)
  const itens = Object.values(sel.qtd).reduce((a, b) => a + b, 0)
  const copiar = async () => { try { await navigator.clipboard.writeText(CONFIG.wifi.senha); setCopiado(true); avisar('Senha copiada. Abra os Ajustes de Wi-Fi do aparelho.') } catch { avisar('Copie a senha manualmente.') } }
  const conta = async () => {
    if (!getMesa() || !getToken()) return ir('/chamar')
    try { ir('/chamado/' + await pedirAtendimento('bill')) } catch (e) { avisar(MENSAGEM_ERRO[e instanceof ApiError ? e.code : 'rede']) }
  }
  const externo = async (url: string, o: string, action: string) => {
    if (m) {   // pontos só pelo toque que abre a página; o app pergunta antes (o cliente escolhe)
      const pts = clube.v?.regras.find(r => r.action === action)?.points ?? 0
      if (pts && window.confirm(`Abrir o ${o} e ganhar +${pts} pontos?`)) { try { const g = await clube.ganhar(action); avisar(g ? `+${g} pontos no seu Clube!` : 'Você já ganhou os pontos desta ação.') } catch { /* sem pontos, abre mesmo assim */ } }
    }
    if (url) window.open(url, '_blank', 'noopener'); else avisar(`O link do ${o} ainda não foi configurado.`)
  }
  return (
    <section className="home">
      <div className="bloco hero-cartao">
        {TEMA.ambiente.length > 0 && <div className="hero-fotos" aria-hidden="true">{TEMA.ambiente.map((f, i) => <img key={f} src={import.meta.env.BASE_URL + f} alt="" loading={i === 0 ? 'eager' : 'lazy'} style={{ animationDelay: `${i * 6}s` }} />)}</div>}
        <div className="hero-texto">
          <h1>{nome}</h1>
          <p>{mesa ? `Você está na Mesa ${mesa}` : TEMA.ambienteTitulo}</p>
          <button className="primario grande" onClick={() => ir('/cardapio')}><IconCardapio /> Ver cardápio</button>
        </div>
      </div>
      <div className="bloco duplo">
        <button className="cartao-link" onClick={() => ir('/pedido')}>
          <span className="topo-c"><IconPrancheta /><b>Meu pedido</b></span>
          <span>{itens ? `${itens} ${itens === 1 ? 'item' : 'itens'}` : 'Escolha seus pratos'}</span>
        </button>
        <button className="cartao-link" onClick={() => ir('/clube')}>
          <span className="topo-c"><IconCartao /><b>Clube</b></span>
          <span>{m ? `${m.saldo} pontos` : 'Entrar e ganhar pontos'}</span>
        </button>
      </div>
      {m && (cv?.roleta?.enabled || cv?.aniv?.enabled) && <div className="bloco duplo">
        {cv?.roleta?.enabled && <button className="cartao-link" onClick={() => ir('/roleta')}><span className="topo-c"><IconCubo /><b>Roleta do Chef</b></span><span>{cv.roleta.grants > 0 ? 'Você tem um giro!' : `${cv.roleta.got.length} de ${cv.roleta.steps.length} etapas`}</span></button>}
        {cv?.aniv?.enabled && <button className="cartao-link" onClick={() => ir('/aniversario')}><span className="topo-c"><IconPresente /><b>Meu aniversário</b></span><span>{cv.aniv.canClaim ? 'Pegue seu presente!' : cv.aniv.diasAte === 1 ? 'É amanhã!' : cv.aniv.diasAte >= 0 && cv.aniv.diasAte < 999 ? `Faltam ${cv.aniv.diasAte} dias` : 'Seu presente'}</span></button>}
      </div>}
      <div className="bloco">
        <h2 className="sub">Serviços</h2>
        <div className="servicos">
          <Servico icone={<IconWifi />} t="Wi-Fi" onClick={() => setWifi(!wifi)} />
          <Servico icone={<IconConta />} t="Pedir a conta" onClick={conta} />
          <Servico icone={<IconCamera />} t="Foto com moldura" onClick={() => ir('/fotos')} />
          <Servico icone={<IconInsta />} t="Instagram" onClick={() => ir('/instagram')} />
          <Servico icone={<IconEstrela />} t="Avalie no Google" onClick={() => ir('/google')} />
          <Servico icone={<IconPesquisa />} t="Como foi a visita?" onClick={() => ir('/visita')} />
        </div>
        {wifi && <div className="wifi"><p>Rede: <b>{CONFIG.wifi.ssid}</b></p><p>Senha: <b>{CONFIG.wifi.senha}</b></p>
          <button className="sec" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar senha'}</button>
          <p className="nota">O site não conecta o celular sozinho. Abra Ajustes e escolha a rede.</p></div>}
      </div>
    </section>
  )
}
