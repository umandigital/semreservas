import { Acoes } from './Home'
export function Servicos({ ir }: { ir: (r: string) => void }) {
  return <section className="tela-int"><h1>Serviços e conexões</h1><Acoes ir={ir} /></section>
}
