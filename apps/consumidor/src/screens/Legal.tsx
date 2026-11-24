import { DOCS, LEGAL, doc } from '../data/legal'

/** Texto de um documento (regulamento, privacidade ou termos). Serve de página (#/privacidade) e de janela dentro do cadastro. */
export function Legal({ id, ir, fechar }: { id: string; ir?: (r: string) => void; fechar?: () => void }) {
  const d = doc(id)
  if (!d) return <section className="tela-int"><h1>Documento não encontrado</h1><button className="primario grande" onClick={() => ir?.('/sobre')}>Voltar</button></section>
  const corpo = (
    <>
      <h1>{d.titulo}</h1><p className="nota">Versão {LEGAL.versao} · {LEGAL.atualizado} · rascunho para a fase de testes</p>
      {d.secoes.map(s => <div key={s.t} className="bloco-c"><h2>{s.t}</h2>{s.p.map((x, i) => <p key={i}>{x}</p>)}</div>)}
      <nav className="links-c" aria-label="Outros documentos">{DOCS.filter(x => x.id !== d.id).map(x => <button key={x.id} className="link" onClick={() => ir?.('/' + x.id)}>{x.titulo}</button>)}</nav>
    </>)
  if (fechar) return <div className="intro" role="dialog" aria-modal="true" aria-label={d.titulo}><div className="intro-topo"><button className="intro-x" onClick={fechar} aria-label="Fechar">✕</button><b>{d.titulo}</b></div><div className="intro-corpo">{corpo}</div><div className="intro-pe" style={{ gridTemplateColumns: '1fr' }}><button className="primario" onClick={fechar}>Voltar ao cadastro</button></div></div>
  return <section className="tela-int">{corpo}</section>
}
