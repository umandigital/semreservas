// Textos legais (RASCUNHO para a fase de testes): o dono do restaurante e o SemReservas devem revisá-los com assessoria jurídica antes de abrir ao público.
// São dados: nome do restaurante e do Clube vêm da configuração; o contato do encarregado fica vazio até ser informado.
import { CLUBE } from './clube'
import { TEMA } from './tema'

export const LEGAL = { versao: 'v1', atualizado: '24/11/2026', controlador: 'Uman Digital (SemReservas), operadora da plataforma SemReservas', contato: '' as string }
export type Doc = { id: 'regulamento' | 'privacidade' | 'termos'; titulo: string; secoes: { t: string; p: string[] }[] }
const demo = `${TEMA.nome} é um restaurante de demonstração e, durante a fase de testes, os prêmios não têm valor real.`

export const DOCS: Doc[] = [
  { id: 'regulamento', titulo: `Regulamento do ${CLUBE.nome}`, secoes: [
    { t: '1. O que é o Clube', p: [`O ${CLUBE.nome} é um programa de relacionamento gratuito do restaurante: você ganha pontos por visitas e interações no aplicativo e troca por prêmios. A participação é voluntária e exige cadastro.`, demo] },
    { t: '2. Quem pode participar', p: ['Pessoas com 13 anos ou mais. Menores de 18 anos participam do Clube, mas não da Roleta do Chef. Cada pessoa tem uma única conta; os pontos pertencem à pessoa cadastrada, não à mesa nem ao aparelho.'] },
    { t: '3. Como ganhar pontos', p: ['A lista atualizada de ações, com os pontos e os limites de cada uma (por dia, por semana, por mês ou uma vez), fica na tela "Como ganhar pontos" do aplicativo. O restaurante pode alterar valores e limites; a mudança vale dali em diante e não altera pontos já ganhos.', 'Só pontuam ações que o sistema registra. Abrir o Instagram ou a página de avaliação do Google rende pontos pelo toque, nunca pelo conteúdo da avaliação, e você escolhe se quer pontuar. A avaliação no Google é livre.'] },
    { t: '4. Trocas', p: ['Os pontos são trocados por prêmios do catálogo na mesa do restaurante, com o comprovante exibido no aplicativo. A troca desconta os pontos na hora, pode ser cancelada pelo cliente em até 2 minutos e é limitada a uma por dia. Alguns prêmios exigem número mínimo de visitas e têm limite por pessoa e por mês.', 'Descontos seguem as condições impressas no comprovante (valor máximo e consumo mínimo).'] },
    { t: '5. Roleta do Chef e aniversário', p: ['A Roleta do Chef é liberada pelo pedido feito no aplicativo com valor mínimo informado na tela, é exclusiva para maiores de 18 anos, tem 5 etapas e o 5º giro entrega o prêmio dentro do prazo indicado. O presente de aniversário vale no dia do aniversário ou no dia seguinte, uma vez por ano. Esses prêmios têm validade própria, sempre informada ao ganhar, e não se acumulam com a troca de pontos no mesmo dia.'] },
    { t: '6. Uso indevido', p: ['Tentativas de fraude, uso de várias contas, automação ou qualquer abuso podem levar ao cancelamento de pontos e prêmios e à suspensão da conta.'] },
    { t: '7. Alterações e encerramento', p: ['O regulamento pode ser alterado; a versão em vigor é a exibida no aplicativo. Você pode excluir sua conta a qualquer momento no próprio Clube, o que apaga seus pontos.'] },
    { t: '8. Dados pessoais', p: ['O tratamento de dados está descrito na Política de Privacidade.'] },
  ] },
  { id: 'privacidade', titulo: 'Política de Privacidade', secoes: [
    { t: '1. Quem somos', p: [`${LEGAL.controlador}, em conjunto com o restaurante ${TEMA.nome}, é responsável pelos dados tratados neste aplicativo. ${LEGAL.contato ? `Contato do encarregado de dados: ${LEGAL.contato}.` : 'Para falar sobre seus dados, use o atendimento do restaurante.'}`] },
    { t: '2. Dados que coletamos', p: ['Cadastro: nome, e-mail (do login por código ou Google) e data de nascimento. Uso do Clube: visitas, pontos, trocas, prêmios, opiniões e comentários que você escrever, e o aceite do regulamento. Atendimento: número da mesa, itens do pedido enviado ao garçom e um identificador do aparelho para evitar chamados falsos.', 'Localização: pode ser pedida no momento de chamar o garçom ou registrar a visita, só para confirmar que você está no restaurante. Guardamos apenas o resultado (perto, longe ou não verificado) e a distância aproximada, nunca a sua posição.'] },
    { t: '3. Para que usamos', p: ['Operar o Clube e o atendimento, calcular pontos e prêmios, evitar fraudes, dar atendimento e gerar estatísticas do restaurante sem identificar você. Não vendemos seus dados e não enviamos publicidade sem o seu consentimento.'] },
    { t: '4. Base legal', p: ['Execução do programa que você aderiu (cadastro e Clube), cumprimento de obrigações legais, legítimo interesse na segurança contra fraudes e, quando indicado, o seu consentimento (por exemplo, divulgar seu nome se você for o cliente do mês).'] },
    { t: '5. Com quem compartilhamos', p: ['Com o restaurante, que vê dados do Clube em números e as informações necessárias ao atendimento, e com os prestadores que mantêm o sistema funcionando: hospedagem e banco de dados (Supabase), hospedagem do site e login com Google. Eles só tratam os dados para prestar o serviço.'] },
    { t: '6. Por quanto tempo guardamos', p: ['Enquanto sua conta existir. Ao excluir a conta, seus dados pessoais, pontos, trocas e opiniões são apagados. Registros de segurança podem ser mantidos sem identificar você, pelo prazo que a lei exigir.'] },
    { t: '7. Seus direitos', p: ['Você pode confirmar o tratamento, acessar, corrigir, pedir portabilidade, retirar consentimentos e excluir seus dados. A exclusão da conta é feita no próprio Clube. Para os demais pedidos, procure o atendimento do restaurante ou o contato acima.'] },
    { t: '8. Crianças e adolescentes', p: ['O Clube é para pessoas com 13 anos ou mais. Menores de 18 anos não participam da Roleta do Chef. Se soubermos de cadastro indevido de uma criança, a conta será apagada.'] },
    { t: '9. Armazenamento no aparelho e segurança', p: ['Guardamos no aparelho informações necessárias ao funcionamento (a mesa por 90 minutos, o seu pedido e a sessão). Usamos conexão segura e controle de acesso por restaurante: um restaurante não enxerga dados de outro.'] },
    { t: '10. Mudanças', p: [`Esta política pode mudar. A versão em vigor é a ${LEGAL.versao}, de ${LEGAL.atualizado}.`] },
  ] },
  { id: 'termos', titulo: 'Termos de Uso', secoes: [
    { t: '1. Aceitação', p: ['Ao usar o aplicativo você concorda com estes termos, com o Regulamento do Clube e com a Política de Privacidade.'] },
    { t: '2. O serviço', p: [`O aplicativo mostra o cardápio do restaurante, permite chamar o garçom, enviar o pedido para o atendimento, participar do Clube, da Roleta do Chef e do aniversário. O pedido enviado é conferido e lançado pelo garçom; o aplicativo não processa pagamentos. ${demo}`] },
    { t: '3. Sua conta', p: ['Você é responsável pelos dados informados e pelo uso da sua conta. Informe dados verdadeiros. Não compartilhe sua conta nem use o aplicativo fora do restaurante para obter vantagens.'] },
    { t: '4. Condutas proibidas', p: ['Fraudar pontos ou prêmios, usar automação, enviar conteúdo ofensivo, ilegal ou com links e contatos nos comentários, tentar acessar áreas ou dados que não são seus.'] },
    { t: '5. Disponibilidade', p: ['O serviço pode ficar indisponível por manutenção ou falhas de internet. Fazemos o possível para manter tudo funcionando, sem garantia de funcionamento ininterrupto.'] },
    { t: '6. Responsabilidade', p: ['Preços, pratos e prêmios são do restaurante. Imagens e modelos em 3D e realidade aumentada são ilustrativos. O SemReservas não se responsabiliza pelo atendimento no restaurante.'] },
    { t: '7. Propriedade intelectual', p: ['As marcas, o aplicativo e seu conteúdo pertencem a seus titulares. É proibido copiar ou reutilizar sem autorização.'] },
    { t: '8. Alterações e lei aplicável', p: [`Os termos podem mudar; vale a versão exibida no aplicativo (${LEGAL.versao}, ${LEGAL.atualizado}). Aplica-se a lei brasileira.`] },
  ] },
]
export const doc = (id: string) => DOCS.find(d => d.id === id)
