"""Validação estática do pacote SEMRESERVAS. Não substitui teste real em navegador/API."""
from pathlib import Path
import json, subprocess, sys, re
import yaml
BASE=Path(__file__).resolve().parent.parent
errors=[];notes=[]
for f in ['shared.js','consumer.js','master.js','owner.js']:
 p=BASE/'prototipos'/f
 if not p.exists():errors.append(f'Ausente: {p}');continue
 result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 if result.returncode:errors.append(f'Erro JS {f}: {result.stderr[:250]}')
 else:notes.append(f'JS sintaxe OK: {f}')
for f in ['index.html','cliente.html','master.html','proprietario.html','styles.css']:
 p=BASE/'prototipos'/f
 if not p.exists() or p.stat().st_size<300:errors.append(f'Arquivo ausente/vazio: {f}')
 else:notes.append(f'Arquivo presente: {f}')
for f in ['logo-oficial-horizontal.png','burger.webp','pizza.webp','gelato.webp','fries.webp','dessert.webp','drink.webp','burger-demo.mp4']:
 p=BASE/'prototipos/assets'/f
 if not p.exists() or p.stat().st_size<1000:errors.append(f'Asset ausente/vazio: {f}')
 else:notes.append(f'Mídia presente: {f} ({p.stat().st_size:,} bytes)')
try:
 y=yaml.safe_load((BASE/'contratos/openapi.yaml').read_text())
 assert y['openapi']=='3.1.0'
 assert len(y['paths'])>=20
 notes.append(f'OpenAPI YAML OK ({len(y["paths"])} caminhos)')
except Exception as e: errors.append(f'OpenAPI YAML inválido: {e}')
try:
 e=json.loads((BASE/'contratos/events.schema.json').read_text())
 assert len(e['properties']['name']['enum'])>=35
 notes.append(f'JSON event schema OK ({len(e["properties"]["name"]["enum"])} eventos)')
except Exception as ex:errors.append(f'Events schema inválido: {ex}')
try:
 sql=(BASE/'arquitetura/schema.sql').read_text()
 count=sql.count('CREATE TABLE ')
 assert count>=25
 notes.append(f'SQL schema presente ({count} tabelas conceituais)')
except Exception as e:errors.append(f'SQL schema insuficiente: {e}')
for text,label in [('sem número de mesa','sem mesa'),('google_review_outbound_click','evento Google'),('Ativar som','som staff'),('idempot','idempotência')]:
 corpus='\n'.join(p.read_text() for p in (BASE/'documentacao').glob('*.md'))
 if text.lower() not in corpus.lower():errors.append(f'Docs sem informação: {label}')
for item in ['cliente.html','proprietario.html','master.html']:
 html=(BASE/'prototipos'/item).read_text()
 if 'shared.js' not in html:errors.append(f'{item} não importa shared.js')
 if item!='cliente.html' and 'authGate' not in html:errors.append(f'{item} não tem tela de login de demonstração')
print('\n'.join(notes))
print('\nRESULTADO:', 'APROVADO ESTATICAMENTE' if not errors else 'FALHOU')
for x in errors:print('ERRO:',x)
sys.exit(1 if errors else 0)
