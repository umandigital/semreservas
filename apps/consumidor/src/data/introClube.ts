// Roteiro do vídeo de introdução do Clube. Serve para QUALQUER estabelecimento: todos os valores são EXEMPLO
// (os do restaurante aparecem na tela do Clube). Texto, ordem e duração são dados; o desenho está em screens/IntroClube.tsx.
export type CenaDado = { id: string; titulo: string; passo?: number; seg: number; legenda: string; frase?: string }

export const CENAS: CenaDado[] = [
  { id: 'abre', titulo: '', seg: 6, legenda: 'Um jeito simples de ganhar prêmios por frequentar o restaurante.' },
  { id: 'oque', titulo: 'O que é o Clube', seg: 10, legenda: 'Cada vez que você usa o restaurante, ganha pontos. Junte os pontos e troque por prêmios.', frase: 'Pontos viram prêmios.' },
  { id: 'entrar', titulo: 'Entre no Clube', passo: 1, seg: 11, legenda: 'Entre com a sua conta Google e complete o perfil: nome e aniversário. Leva um minuto e já rende pontos.', frase: 'Entrar leva um minuto.' },
  { id: 'visita', titulo: 'Ganhe a cada visita', passo: 2, seg: 11, legenda: 'Ao sentar, encoste o celular na placa da mesa. Cada visita dá pontos, uma vez por dia.', frase: 'Cada visita dá pontos.' },
  { id: 'voltar', titulo: 'Volte e ganhe mais', passo: 3, seg: 12, legenda: 'Quanto mais você volta, mais ganha: voltar em poucos dias e juntar visitas no mês rendem pontos extras.', frase: 'Voltar rende mais.' },
  { id: 'outras', titulo: 'Outras formas de ganhar', passo: 4, seg: 13, legenda: 'Dê a sua opinião depois da conta, tire uma foto com moldura ou indique um amigo. Cada uma tem seu limite.', frase: 'Participar dá pontos.' },
  { id: 'trocar', titulo: 'Troque por um prêmio', passo: 5, seg: 13, legenda: 'Com pontos suficientes, toque em Trocar e mostre o comprovante ao garçom. Os pontos saem na hora.', frase: 'Trocou, mostrou, recebeu.' },
  { id: 'numeros', titulo: 'Seus dois números', seg: 11, legenda: '"Seus pontos" é o que você pode gastar. "Total ganho" só cresce: é a sua história no Clube.', frase: 'Trocar gasta os pontos, não o total.' },
  { id: 'regras', titulo: 'Cada restaurante tem as suas regras', seg: 9, legenda: 'Os números deste vídeo são exemplos. Cada restaurante escolhe quanto vale cada ação e quais prêmios oferece.', frase: 'Veja as regras do seu na tela do Clube.' },
  { id: 'duvidas', titulo: 'Dúvidas comuns', seg: 0, legenda: '' },
  { id: 'fecho', titulo: 'Pronto!', seg: 0, legenda: '' },
]

export const DUVIDAS: [string, string][] = [
  ['E se eu não estiver no restaurante?', 'Você vê seus pontos, mas ganha e troca só na mesa. Cadastro, Instagram e indicação podem ser feitos de qualquer lugar.'],
  ['E se eu esquecer de encostar na placa?', 'Não há pontos retroativos. Encoste na próxima visita.'],
  ['Posso trocar em outro dia?', 'Sim, com o seu prêmio liberado, na mesa, uma troca por visita.'],
  ['Perco o total se eu trocar?', 'Não. O total ganho nunca diminui.'],
  ['Preciso mostrar algo ao garçom?', 'Só o comprovante da troca. Para ganhar pontos, não.'],
]

export const duracaoTotal = () => CENAS.reduce((a, c) => a + c.seg, 0)
