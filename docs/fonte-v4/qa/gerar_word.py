from pathlib import Path
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
BASE=Path(__file__).resolve().parent.parent
out=BASE/'SEMRESERVAS_Handoff_Executivo_v1_0.docx'
PURPLE=RGBColor(63,18,112); ORANGE=RGBColor(245,111,36); GREY=RGBColor(93,83,106)
doc=Document();sec=doc.sections[0]
sec.page_width=Cm(21);sec.page_height=Cm(29.7)
sec.top_margin=Cm(2.1);sec.bottom_margin=Cm(1.9);sec.left_margin=Cm(2.05);sec.right_margin=Cm(2.05)
styles=doc.styles
normal=styles['Normal'];normal.font.name='Aptos';normal.font.size=Pt(9.4);normal.font.color.rgb=RGBColor(43,33,54)
normal.paragraph_format.space_after=Pt(5);normal.paragraph_format.line_spacing=1.13
for name,size,col in [('Title',30,PURPLE),('Heading 1',17,PURPLE),('Heading 2',12,ORANGE),('Heading 3',10,PURPLE)]:
 st=styles[name];st.font.name='Aptos Display' if name in ['Title','Heading 1'] else 'Aptos';st.font.size=Pt(size);st.font.bold=True;st.font.color.rgb=col;st.paragraph_format.space_before=Pt(14 if name!='Title' else 0);st.paragraph_format.space_after=Pt(7);st.paragraph_format.keep_with_next=True
style=styles.add_style('SmallNote',WD_STYLE_TYPE.PARAGRAPH);style.font.name='Aptos';style.font.size=Pt(8);style.font.color.rgb=GREY;style.paragraph_format.space_after=Pt(3)

header=sec.header.paragraphs[0];header.text='SEMRESERVAS  /  Handoff executivo técnico';header.style='SmallNote';header.alignment=WD_ALIGN_PARAGRAPH.RIGHT
footer=sec.footer.paragraphs[0];footer.text='MVP v1.0  •  04.11.2026   |   Documento de referência para revisão · não é implementação';footer.style='SmallNote';footer.alignment=WD_ALIGN_PARAGRAPH.CENTER

def para(t,style=None): return doc.add_paragraph(t,style)
def h1(t):doc.add_heading(t,1)
def h2(t):doc.add_heading(t,2)
def h3(t):doc.add_heading(t,3)
def bullet(t):return doc.add_paragraph(t,style='List Bullet')
def number(t):return doc.add_paragraph(t,style='List Number')
def table(headers,rows,widths=None):
 t=doc.add_table(rows=1,cols=len(headers));t.autofit=False;t.alignment=WD_TABLE_ALIGNMENT.CENTER
 for j,val in enumerate(headers):
  t.rows[0].cells[j].text=str(val);t.rows[0].cells[j].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
  tcPr=t.rows[0].cells[j]._tc.get_or_add_tcPr();sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'38156B');tcPr.append(sh)
  for run in t.rows[0].cells[j].paragraphs[0].runs:run.font.color.rgb=RGBColor(255,255,255);run.font.bold=True;run.font.size=Pt(8)
 for i,row in enumerate(rows):
  cells=t.add_row().cells
  for j,val in enumerate(row):
   cells[j].text=str(val)
   for par in cells[j].paragraphs:
    par.paragraph_format.space_after=Pt(1)
    for run in par.runs:run.font.size=Pt(8.1)
   if i%2==1:
    shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'F4F0F9');cells[j]._tc.get_or_add_tcPr().append(shade)
 if widths:
  for row in t.rows:
   for i,w in enumerate(widths):row.cells[i].width=Cm(w)
 doc.add_paragraph('')
 return t

# Cover
p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p.add_run().add_picture(str(BASE/'prototipos/assets/logo-oficial-horizontal.png'),width=Cm(12.8))
doc.add_paragraph('')
p=doc.add_paragraph(style='Title');p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.add_run('Escopo, arquitetura e handoff técnico')
p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.add_run('MVP SEMRESERVAS • RESTOPUB → PULPO → Bagé/RS').bold=True
p=doc.add_paragraph(style='SmallNote');p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.add_run('Pacote v1.0 | 04 de novembro de 2026 | Proposta técnica para validação com Claude Code')
doc.add_paragraph('')
para('Uma plataforma SaaS, três experiências: consumidor, administrador SEMRESERVAS e proprietário/equipe. O ponto de entrada NFC é o diferencial físico, mas a entrega comercial é experiência, engajamento mensurável, relacionamento e inteligência de marketing.')
para('Documento derivado do Documento Mestre v2.0 (28/10/2026) e das revisões posteriores indicadas pelo fundador. O conteúdo detalhado está no DOCUMENTO_TECNICO_INTEGRAL_PARA_CLAUDE_CODE.md e nos contratos anexos. Não declarar módulos, preços ou indicadores como prontos/validados.')

doc.add_page_break()
h1('1 · Resumo executivo e decisões')
para('SEMRESERVAS é uma plataforma web de experiências gastronômicas acessada via NFC/QR/site, sem aplicativo nativo. O consumidor interage com pratos, pedido e recursos de atendimento. O empresário acompanha engajamento, fidelização e um relatório mensal de recomendações; não existe atribuição comprovada de vendas adicionais.')
for x in ['O desenvolvimento será realizado pelo fundador com auxílio de ferramentas de IA.','Primeiro construir RESTOPUB fictício funcional; depois testar em operação real com PULPO Cozinha Criativa.','Venda inicialmente presencial em Bagé, demonstrando no celular o display NFC.','Placas/TAGs são móveis: nenhum número de mesa gravado nem solicitado no primeiro acesso.','Logo SEMRESERVAS fornecido e aprovado: não redesenhar. Customização principal é do restaurante.','Reservas de mesa, pagamento online e substituição de PDV/estoque/cozinha não fazem parte do núcleo inicial.']:bullet(x)
h2('Status de produto')
table(['Decisão','Classificação'],[['NFC + experiência de mesa como prioridade','Aprovado'],['Login apenas quando benefício pessoal exigir','Diretriz refinada'],['Pedido ao garçom sem preços / sem mesa na TAG','Decisão posterior'],['Som + fila visual de garçom','Requisito solicitado / validação técnica'],['Home configurável por estabelecimento','Diretriz posterior'],['Preços, planos e teste de 30 dias','Pendentes'],['Catálogo/branding reais da PULPO','Pendentes de aprovação']],[12,5])

h1('2 · As três interfaces')
table(['Ambiente','Responsabilidade','Autenticação'],[
['Consumidor','Home da loja, feed, pedidos, interação, benefícios e serviços','Visitante público; member opcional'],
['SEMRESERVAS Master','Tenants, marca, catálogo, funções, TAGs, relatórios, usuários, auditoria','Obrigatória e forte'],
['Proprietário/equipe','Indicadores, atendimento, clube, campanhas e relatórios','Obrigatória, restrita ao tenant']],[4,9,4])
para('A mesma aplicação serve restaurantes diferentes com temas, textos, fotos, grupos, feature flags e dados isolados. Não criar versões independentes do código para cada cliente.')

h1('3 · Acesso público, login e fidelização')
table(['Funcionalidade','Precisa login do consumidor?'],[
['Home, feed, fotos/vídeos, ingredientes, filtro de categorias','Não'],['Montar seleção e mostrar ao garçom','Não'],['Chamar garçom/solicitar conta','Não; exige proteção de abuso'],['Abrir Instagram e avaliação Google','Não'],['Exibir rede Wi-Fi e copiar senha','Não'],['Fotos com molduras e compartilhamento','Não'],['Pesquisa interna não pontuável','Não'],['Curtir/favoritar localmente','Não obrigatório; limites'],['Comentários públicos persistentes','Proposta: identidade e moderação'],['Carteira de pontos, histórico e resgate','Sim; crédito validado'],['Gestores, staff e Master','Sim, sempre']],[12,5])
para('Login não significa aceite para marketing. Pontos e recompensas exigem identidade e comprovação confiável da ação. Não premiar avaliações públicas no Google; cliques Instagram/Google não são curtidas nem avaliações confirmadas.')

h1('4 · Navegação e UX proposta')
for x in ['Home personalizada com quatro acessos principais e grupos secundários de redes, serviços e experiências.','Feed vertical em foto/vídeo, com categorias tipo destaques, nome e preço nítidos, legenda em gradiente expansível, ações sociais e botão de pedido.','Mínimo de quatro itens de demonstração em cada categoria; sem tela obrigatória de cardápio em lista.','Carrinho com subtotal para o consumidor. Modo garçom em alto contraste, grande, legível e SEM valores; botão de chamar garçom logo abaixo.','Rodapé móvel com Início, Cardápio, Pedido, Clube e Serviços; cabeçalho compacto com ações prioritárias.','PULPO no protótipo é apenas simulação visual: logo, paleta, produtos e preços precisam de validação pelo estabelecimento.']:bullet(x)

h1('5 · Comunicação da plataforma')
para('Recomendação inicial para avaliação: monólito modular TypeScript, React web responsivo, PostgreSQL, armazenamento de mídia em bucket/CDN, fila de jobs e mecanismo SSE (Server-Sent Events) para avisos operacionais. A stack exata é proposta e deverá ser justificada pelo Claude Code, com alternativas e custos.')
table(['Fluxo','Protocolo / regra'],[
['NFC/QR → visitante','GET /r/token → resolve tenant ativo → redirect HTTPS para Home pública'],
['Visitante → catálogo/feedback','REST/JSON, páginas publicadas, rate limit e session pseudônima'],
['Visitante → chamado','POST autenticado por token de capacidade/sessão anônima; persiste estado no banco'],
['Servidor → painel staff','SSE com replay/heartbeat; fallback polling; staff autentica e revalida a fila'],
['Staff → concluir chamado','PATCH com versão/idempotência; auditoria + evento transacional'],
['Master → customização','DRAFT → PREVIEW → PUBLISH; cache invalidado; histórico e rollback'],
['Dados → Insights IA','SQL agregado → validação → IA → revisão automática → revisão humana → relatório']],[5,12])
para('O sistema de notificações não é fonte de verdade: a transação no banco registra o chamado; o SSE somente entrega aviso. A tela da equipe deve recuperar pendências após reconexão. O áudio exige ativação por gesto do usuário, por restrições de navegador.')

doc.add_page_break()
h1('6 · Chamar garçom: regra de operação')
para('Como as TAGs poderão circular entre mesas, o sistema não pode presumir sua localização. A proposta mínima é permitir ao cliente informar a área aproximada (salão, varanda ou balcão), uma referência opcional e receber um código curto a ser mostrado. O código de quatro dígitos facilita conferência mas NÃO é um autenticador de API.')
for x in ['POST cria serviço em estado PENDING, com limiter e dedupe.','Painel staff exibe banner grande, contador, hora, área e código.','Botão Ativar som libera AudioContext no gesto do operador; alerta visual funciona mesmo sem som.','Staff assume ACKNOWLEDGED e marca RESOLVED após conclusão presencial; estados e tempos auditados.','Se ninguém monitorar o painel ou a pessoa não puder ser localizada, desativar o módulo até definir processo viável.']:number(x)

h1('7 · Dados e módulos de fidelização')
para('Tenant isolation é requisito de segurança. O banco conceitual inclui tenants, unidades, publicação da Home, feature flags, auth, RBAC, categorias, produtos, mídias, tags, pontos de acesso, sessões, eventos, seleções, chamados, carteiras e ledger, recompensas, campanhas, comentários, pesquisas, relatórios, outbox e audit logs.')
for x in ['Pontos por compra validada: prova e operador autorizado, ledger imutável e idempotência.','Favoritos/curtidas anônimos são sinais de interesse, não clientes únicos ou compras.','Fotos são montadas no navegador e não armazenadas pelo backend por padrão.','Relatórios usam dados agregados por estabelecimento e período; não inferir atributos sensíveis.','Acesso a dados depende de papel, tenant e unidade. Todas as ações sensíveis deixam auditoria.']:bullet(x)

h1('8 · Insights e relatórios mensais')
para('Os indicadores deverão usar linguagem simples e explicar amostra, período e limitação: entradas NFC/QR, sessões e exploração de pratos, vídeos, curtidas, favoritos, comentários, seleções, pedidos preparados, pesquisas internas, pontos e resgates verificados, chamados, cliques externos e fotos com molduras.')
table(['Parte do pipeline','Função'],[
['Agregação sem IA','SQL determinístico e fontes de números'],['Qualidade de dados','Detectar amostra baixa, duplicação, dados faltantes'],['Oportunidades com IA','Hipóteses, não inferência causal'],['Redação acessível com IA','O que ocorreu, hipótese, o que testar, como medir'],['Revisão de segurança','Conferir dados, evidências, políticas e PII'],['Aprovação e entrega','Master revisa; relatório aprovado disponível ao empresário']],[6,11])
para('O sistema NÃO mede vendas adicionais, seguidores, curtidas no Instagram nem avaliações Google publicadas pelo simples clique. Fotos geradas/compartilhamentos iniciados não comprovam postagem externa.')

h1('9 · Produtos físicos, custos e rollout')
table(['Material','Custo/lote','Custo unitário'],[['50 displays acrílicos','R$ 122,00','R$ 2,44'],['50 NTAG213','R$ 42,00','R$ 0,84'],['20 NTAG215 preparadas para metal','R$ 67,00','R$ 3,35'],['1.000 ímãs impressos','R$ 223,00','R$ 0,223']],[9,4,4])


doc.add_page_break()
h1('10 · Backlog por marcos')
table(['Marco','Entregas / gate'],[
['A · Base','Repositório, auth de gestão, banco, tenant isolation, marcas, mídias'],
['B · RESTOPUB','NFC/QR, Home, feed, seleção, mostrar garçom, eventos, links externos'],
['C · Atendimento','Chamado persistente, SSE/polling, áudio opt-in, ack/resolved e testes operacionais'],
['D · Relação','Identidade member, carteira, crédito comprovado, resgates, pesquisa'],
['E · Insights','Agregados, skills IA, revisão Master, PDF/painel proprietário'],
['F · Experimentos','Fotos, comentários avançados, IA concierge, delivery e automações extras']],[4,13])

h1('11 · Riscos e pendências que a IA deve apontar')
for x in ['Como localizar cliente com TAG móvel sem mesa? Área e código bastam?','Qual canal SSE/polling e como recuperar mensagens perdidas?','Qual solução de autenticação member reduz atrito e custo?','Como garantir pontos verificáveis sem integração com PDV?','Como manter vídeos e personalizações economicamente escaláveis?','Como validar o conteúdo real e os direitos de imagem da PULPO?','Qual infraestrutura, custos fixos/variáveis, backups e suporte?','Como preservar LGPD e políticas de plataformas externas?','Qual nível de automação do relatório e da revisão humana?','Como reconciliar assinatura do logo oficial e slogan textual anterior?']:bullet(x)

h1('12 · Ordem de leitura pelo Claude Code')
para('O arquivo principal de ingestão é DOCUMENTO_TECNICO_INTEGRAL_PARA_CLAUDE_CODE.md. Os nove documentos por assunto, contratos OpenAPI/eventos, DDL SQL, diagramas, protótipos e cenários de QA acompanham o mesmo pacote ZIP. A IA deve responder primeiro com diagnóstico, riscos, ADR proposta, revisão de requisitos, backlog, custos e decisões pendentes; aguardar aprovação antes de programar produção.')
para('Os protótipos são demonstrativos, com armazenamento local e comunicação entre abas no mesmo navegador. Não devem ser implantados publicamente como produto pronto. A execução de testes E2E de browser precisa ser feita pelo destinatário; neste ambiente foi possível verificar sintaxe, estrutura e contratos, mas não homologar navegador/áudio.')

out.parent.mkdir(parents=True,exist_ok=True);doc.save(out)
print(out)
