# Tema do restaurante (white-label) e home personalizável

Objetivo: cada restaurante tem o **seu** app (cores, logo, imagem da home), editado pelo dono sem programador. O código do app nunca fala "GastroPub": lê um **tema** do banco.

## 1. Paleta do SemReservas GastroPub (extraída do logo)
| Papel | Cor | Uso |
|---|---|---|
| Fundo | `#380818` (vinho) | fundo do app |
| Painel | `#4A1226` / `#5E1B34` | cartões, barra inferior, chips |
| Destaque | `#E09060` (terracota) | botões principais, aba ativa, links |
| Texto | `#F8E8C8` (creme) | texto principal |
| Texto suave | creme a 70% | textos secundários |
O contraste creme sobre vinho e vinho sobre terracota passa no mínimo de legibilidade (AA).

## 2. Como o tema funciona
- **Três cores-base** escolhidas pelo dono (fundo, destaque, texto); o sistema **deriva** painéis, bordas, estados e variações. Menos erro e visual sempre coerente.
- **Trava de legibilidade**: o sistema calcula o contraste (WCAG AA) e **recusa** combinações ilegíveis, com mensagem clara ("texto claro demais sobre este fundo").
- No app, o tema vira variáveis CSS (`--bg`, `--painel`, `--destaque`, `--texto`…) aplicadas na abertura; guardado no aparelho para abrir sem piscar a cor antiga.
- **Rascunho e publicação**: o dono edita num rascunho, vê a prévia no celular e **publica**; dá para **voltar à versão anterior**. É o que o roadmap prevê para o Master, só que já útil ao dono.

## 3. Home personalizável (áreas que o dono troca)
| Área | O que o dono configura | Tamanho e regras |
|---|---|---|
| **Banner principal** | imagem, título curto, subtítulo, botão (texto e destino: cardápio, prato, promoção, link) | imagem **1080×1350 px (4:5)**, WebP até 400 KB; **zona segura**: texto e rosto no terço central, bordas podem ser cortadas em telas diferentes |
| **Vários banners** | até 5, em carrossel, com ordem e datas de início/fim | mesmas regras; o primeiro é o que carrega mais rápido |
| **Destaque do dia** | escolhe 1 a 3 pratos do cardápio | usa as fotos do próprio cardápio |
| **Cartão de promoção** | texto e regra da promoção do mês (ex.: aniversário) | bloco de texto + botão |
| **Aviso de cadastro** | liga/desliga e texto | o cliente pode fechar |
| **Logo** | upload (SVG ou PNG transparente) | SVG preferido; versão clara e escura |
| **Rodapé institucional** | fixo: "SEMRESERVAS · Uma tecnologia UmanDigital" | não editável pelo restaurante |

## 4. Como construir (ordem)
1. **Agora (Bloco A)**: tema do GastroPub como dados no código (`CONFIG.tema`), componentes já lendo as variáveis. Banner principal com 1 imagem enviada por nós.
2. **Banco (migração 0005)**: tabela `tenant_branding` (cores, logo, banners, publicado_em, rascunho) e função pública `public_branding(slug)` que devolve só o publicado. Imagens num bucket público do Storage, com envio permitido só ao dono do restaurante e redimensionamento no navegador (WebP, limite de peso).
3. **Dashboard do dono**: tela "Aparência" com seletor de cores com a trava de contraste, upload de logo e banners, ordem, datas, prévia e botão Publicar/Reverter.
4. **Master (Fase 3)**: mesma tela, para criar restaurantes novos já com tema.

## 5. Testes que protegem isso
- Isolamento: o dono de um restaurante nunca edita o tema de outro (teste SQL, como os demais).
- Contraste: teste automático recusa combinações abaixo de AA.
- Imagem: recusa arquivo fora do peso/proporção e mostra a prévia antes de publicar.
