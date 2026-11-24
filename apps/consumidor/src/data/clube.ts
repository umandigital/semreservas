// Clube do restaurante: textos, regras e prêmios como DADO. Espelha o catálogo do banco (migração 0005 / docs/10).
// Em produção o servidor devolve regras e prêmios (club_rules / club_catalog); este arquivo é o padrão e o modo sem banco.
export type Limite = 'once' | 'per_day' | 'per_week' | 'per_month' | 'unlimited'
export type Grupo = 'cadastro' | 'visita' | 'voltar' | 'app' | 'opiniao' | 'divulgar' | 'indicar'
export type Regra = { action: string; rotulo: string; grupo: Grupo; points: number; limit: Limite; n: number; claimable: boolean; capped: boolean }

export const CLUBE = {
  nome: 'Clube SemReservas GastroPub', termo: 'v1', cancelarSeg: 120, comprovanteMin: 30, tetoMensal: 200,
  grupos: { cadastro: 'Cadastro', visita: 'Visita', voltar: 'Volte e ganhe mais', app: 'Use o app na mesa', opiniao: 'Depois da conta', divulgar: 'Fotos e divulgação', indicar: 'Indique um amigo' } as Record<Grupo, string>,
}
const R = (action: string, rotulo: string, grupo: Grupo, points: number, limit: Limite, n: number, claimable: boolean, capped: boolean): Regra => ({ action, rotulo, grupo, points, limit, n, claimable, capped })
export const REGRAS: Regra[] = [
  R('signup', 'Cadastro no Clube', 'cadastro', 30, 'once', 1, false, false), R('profile_complete', 'Completar o perfil', 'cadastro', 20, 'once', 1, false, false),
  R('install_app', 'Instalar o app', 'cadastro', 20, 'once', 1, true, false), R('enable_notifications', 'Ativar avisos', 'cadastro', 10, 'once', 1, true, false),
  R('checkin', 'Visita ao restaurante', 'visita', 30, 'per_day', 1, false, false),
  R('return_7d', 'Voltar em até 7 dias', 'voltar', 20, 'per_week', 1, false, false), R('visits_3_month', '3 visitas no mês', 'voltar', 40, 'per_month', 1, false, false),
  R('streak_4w', '4 semanas seguidas', 'voltar', 50, 'unlimited', 1, false, false), R('full_table', 'Mesa cheia (3 do Clube)', 'voltar', 15, 'per_day', 1, false, false),
  R('order_via_app', 'Fazer o pedido pelo app', 'app', 10, 'per_day', 1, false, true), R('ar_used', 'Ver o prato na mesa (RA)', 'app', 5, 'per_day', 3, true, true),
  R('like_dish', 'Curtir pratos', 'opiniao', 5, 'per_day', 3, false, true), R('rate_dish', 'Dar nota ao prato', 'opiniao', 5, 'per_day', 3, false, true),
  R('comment_dish', 'Comentar um prato', 'opiniao', 20, 'per_day', 3, false, true), R('survey', 'Responder a pesquisa', 'opiniao', 10, 'per_day', 1, false, true),
  R('suggestion', 'Deixar uma sugestão', 'opiniao', 10, 'per_day', 1, false, true),
  R('photo_frame', 'Foto com moldura', 'divulgar', 15, 'per_day', 1, true, true), R('share_photo', 'Compartilhar a foto', 'divulgar', 10, 'per_week', 1, true, true),
  R('share_app', 'Compartilhar o app', 'divulgar', 10, 'per_week', 1, true, true), R('instagram_follow', 'Seguir no Instagram', 'divulgar', 20, 'once', 1, true, false),
  R('google_open', 'Abrir a página do Google', 'divulgar', 20, 'once', 1, true, false),
  R('referral', 'Indicar um amigo', 'indicar', 100, 'unlimited', 1, false, false),
]
/** Ações que ainda NÃO existem no app: ficam fora da lista e da introdução até serem construídas (o cliente só vê o que consegue ganhar). */
export const NAO_IMPLEMENTADAS = new Set(['install_app', 'enable_notifications', 'order_via_app', 'ar_used', 'rate_dish', 'suggestion', 'share_app', 'campaign_checkin'])
export const REGRAS_ATIVAS: Regra[] = REGRAS.filter(r => !NAO_IMPLEMENTADAS.has(r.action))
export type Premio = { id: string; nome: string; custo: number; minVisitas: number; porPessoaMes: number | null }
export const PREMIOS: Premio[] = [
  { id: 'sorvete', nome: 'Sorvete com 2 bolas', custo: 200, minVisitas: 0, porPessoaMes: 4 },
  { id: 'refri', nome: 'Refrigerante ou entrada', custo: 350, minVisitas: 0, porPessoaMes: null },
  { id: 'desconto', nome: '30% de desconto na conta (até R$ 30, conta mínima R$ 80)', custo: 500, minVisitas: 0, porPessoaMes: null },
  { id: 'pizza', nome: 'Pizza à escolha', custo: 1000, minVisitas: 8, porPessoaMes: 1 },
]
export const textoLimite = (r: Regra) => r.limit === 'once' ? 'uma vez' : r.limit === 'unlimited' ? 'sem limite' : `${r.n === 1 ? '1 vez' : r.n + ' vezes'} ${r.limit === 'per_day' ? 'por dia' : r.limit === 'per_week' ? 'por semana' : 'por mês'}`

// Extras do restaurante (fora do Clube): padrão e modo sem banco. Em produção valem os da configuração do restaurante.
export const ROLETA = { passos: ['Panela', 'Faca', 'Fogão', 'Forno', 'Prato'], minCents: 8000, janelaDias: 60, premio: 'Pizza à escolha', validadeDias: 30, demo: true }
export const ANIV = { beneficio: 'Sobremesa da casa', pctConvidados: 50, minConvidados: 5, validadeDias: 2, demo: true }
