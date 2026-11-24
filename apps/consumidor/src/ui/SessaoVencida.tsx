
/** Quando falta a mesa (a sessão de 90 minutos acabou): pede para encostar o celular na placa. */
export function SessaoVencida({ titulo = 'O tempo acabou', onVoltar }: { titulo?: string; onVoltar?: () => void }) {
  return (
    <section className="tela-int sessao-v">
      <h1>{titulo}</h1>
      <div className="papel">
        <svg viewBox="0 0 220 150" width="220" height="150" role="img" aria-label="Celular encostando na placa da mesa">
          <rect x="120" y="40" width="64" height="86" rx="8" fill="#e09060" stroke="#380818" strokeWidth="4" /><text x="152" y="88" textAnchor="middle" fontSize="12" fill="#380818" fontWeight="800">Mesa</text>
          <path d="M175 30c10 4 16 12 18 22M170 18c16 6 26 20 28 36" fill="none" stroke="#e09060" strokeWidth="5" strokeLinecap="round" />
          <g transform="rotate(-18 70 90)"><rect x="40" y="48" width="56" height="96" rx="10" fill="#fff" stroke="#380818" strokeWidth="4" /><rect x="48" y="60" width="40" height="64" rx="4" fill="#5e1b34" /></g>
        </svg>
        <p><b>Encoste o celular na placa da sua mesa</b> para continuar.</p>
        <p className="nota-p">Assim confirmamos que você está no restaurante.</p>
      </div>
      {onVoltar && <button className="link" onClick={onVoltar}>Voltar</button>}
    </section>
  )
}
