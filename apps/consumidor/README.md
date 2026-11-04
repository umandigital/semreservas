# consumidor

Webapp público aberto por NFC/QR. Vite + React + TypeScript.

```bash
cd apps/consumidor
cp .env.example .env.local   # preencher URL e chave pública do Supabase
npm install
npm run dev                   # http://localhost:5173/semreservas/
npm test && npm run build
```

Rotas: `/r/{token}` (placa) e a raiz. O caminho base vem de `BASE_PATH` (`/semreservas/` no teste, `/` no domínio definitivo).
