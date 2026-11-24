import { CONFIG } from '../data/cardapio'
import { TEMA } from '../data/tema'
import { avisar } from '../lib/mockStore'
import { useClube } from '../lib/clube'
import { IconEstrela, IconInsta } from '../ui/Icons'

type Props = { ir: (r: string) => void; canal: 'instagram' | 'google' }
const FOTOS = ['burger', 'dessert', 'drink', 'fries']

/** Instagram e Google: tela de explicação e dois botões. Os pontos valem só pelo toque que abre a página, e o cliente escolhe se quer pontuar. */
export function Social({ ir, canal }: Props) {
  const c = useClube(); const v = c.v; const membro = !!v?.membro
  const ig = canal === 'instagram'; const url = ig ? CONFIG.instagram : CONFIG.googleAvaliacao; const action = ig ? 'instagram_follow' : 'google_open'
  const pts = v?.regras.find(r => r.action === action)?.points ?? 0
  const abrir = async (ganhar: boolean) => {
    if (ganhar) { try { const g = await c.ganhar(action); avisar(g ? `+${g} pontos no seu Clube!` : 'Você já ganhou os pontos desta ação.') } catch { /* abre mesmo assim */ } }
    if (url) window.open(url, '_blank', 'noopener'); else avisar('O link ainda não foi configurado.')
  }
  return (
    <section className="tela-int social">
      <button className="link" onClick={() => ir('/')}>← Início</button>
      <div className="ic-grande">{ig ? <IconInsta /> : <IconEstrela />}</div>
      <h1>{ig ? 'Siga-nos no Instagram' : 'Avalie-nos no Google'}</h1>
      {ig ? <>
        <p>Veja os bastidores da casa, novidades do cardápio, eventos e momentos de quem passa por aqui.</p>
        <div className="fotos-g">{FOTOS.map(f => <img key={f} src={import.meta.env.BASE_URL + `media/${f}.webp`} alt="" loading="lazy" />)}</div>
        <div className="bloco-c"><b>Seu próximo motivo para voltar pode estar no feed.</b></div>
      </> : <>
        <h2>Como foi sua visita?</h2>
        <p>Conte sua experiência no Google. Sua opinião ajuda outras pessoas a conhecer {TEMA.nome} e nos ajuda a melhorar.</p>
        <div className="bloco-c"><b>Sua avaliação é livre</b><p>Compartilhe o que realmente achou, com a nota que fizer sentido para você. Os pontos valem só por abrir a página, nunca pelo que você escrever.</p></div>
      </>}
      {membro && pts > 0 && <button className="primario grande" onClick={() => abrir(true)}>{ig ? 'Abrir o Instagram' : 'Abrir as avaliações'} e ganhar +{pts} pontos</button>}
      <button className={membro && pts > 0 ? 'sec grande' : 'primario grande'} onClick={() => abrir(false)}>{ig ? 'Abrir o Instagram' : 'Abrir as avaliações'}{membro && pts > 0 ? ' sem pontos' : ''}</button>
      {!membro && <button className="link" onClick={() => ir('/entrar')}>Entre no Clube para ganhar pontos por isso</button>}
      <p className="nota">Você será direcionado {ig ? 'ao Instagram' : 'ao Google'}.</p>
    </section>
  )
}
