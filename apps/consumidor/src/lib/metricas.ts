// Métricas de atendimento do dono. Contam CHAMADOS e tempos de resposta. Não medem vendas.
export type Linha = { id: string; table_label: string; kind: string; status: string; created_at: string; acknowledged_at: string | null; resolved_at: string | null }
export type Metricas = {
  total: number; atendidos: number; cancelados: number; abertos: number
  medianaVistoS: number | null; medianaConclusaoS: number | null; maiorEsperaS: number | null
  porMotivo: { kind: string; total: number }[]; porMesa: { mesa: string; total: number }[]
}

export const mediana = (v: number[]): number | null => {
  if (!v.length) return null
  const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}
const seg = (de: string, ate: string) => Math.max(0, Math.round((Date.parse(ate) - Date.parse(de)) / 1000))
const contar = <K extends string>(l: Linha[], chave: (x: Linha) => K) => {
  const m = new Map<K, number>(); for (const x of l) m.set(chave(x), (m.get(chave(x)) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

export function calcularMetricas(linhas: Linha[]): Metricas {
  const vistos = linhas.filter(l => l.acknowledged_at).map(l => seg(l.created_at, l.acknowledged_at!))
  const concl = linhas.filter(l => l.status === 'RESOLVED' && l.resolved_at).map(l => seg(l.created_at, l.resolved_at!))
  return {
    total: linhas.length,
    atendidos: linhas.filter(l => l.status === 'RESOLVED').length,
    cancelados: linhas.filter(l => l.status === 'CANCELLED').length,
    abertos: linhas.filter(l => l.status === 'PENDING' || l.status === 'ACKNOWLEDGED').length,
    medianaVistoS: mediana(vistos), medianaConclusaoS: mediana(concl), maiorEsperaS: vistos.length ? Math.max(...vistos) : null,
    porMotivo: contar(linhas, l => l.kind).map(([kind, total]) => ({ kind, total })),
    porMesa: contar(linhas, l => l.table_label).slice(0, 5).map(([mesa, total]) => ({ mesa, total })),
  }
}
export const fmtDuracao = (s: number | null) => s === null ? 'sem dados' : s < 60 ? `${s} s` : s < 3600 ? `${Math.floor(s / 60)} min ${s % 60 ? (s % 60) + ' s' : ''}`.trim() : `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`
