import '@google/model-viewer'
import { useEffect, type MutableRefObject } from 'react'
import type { Item } from '../data/cardapio'
import { media } from '../lib/util'
import type { ModeloEl } from '../ui/model-viewer'

/** Prato em 3D dentro do cardápio. Este arquivo importa o <model-viewer>, então só baixa quando um prato 3D chega perto da tela. */
export default function Modelo3D({ item, ativo, mvRef, aoCarregar }: { item: Item; ativo: boolean; mvRef: MutableRefObject<ModeloEl | null>; aoCarregar: (ra: boolean) => void }) {
  const m = item.modelo!
  useEffect(() => {
    const el = mvRef.current; if (!el) return
    const ok = () => aoCarregar(!!el.canActivateAR); el.addEventListener('load', ok)
    if (el.loaded) ok()
    return () => el.removeEventListener('load', ok)
  }, [mvRef, aoCarregar])
  return (
    <model-viewer ref={el => { mvRef.current = el }} src={media(m.glb)} alt={`Modelo 3D de ${item.nome}`}
      ar ar-modes="scene-viewer webxr quick-look" ar-placement="floor" ar-scale="fixed"
      camera-controls disable-zoom disable-pan touch-action="pan-y" camera-orbit={m.orbita} auto-rotate={ativo ? '' : undefined} rotation-per-second="16deg"
      shadow-intensity="1.1" shadow-softness="0.9" exposure="1.05" environment-image="neutral" interaction-prompt="none">
      <button slot="ar-button" hidden aria-hidden="true" tabIndex={-1} />
    </model-viewer>
  )
}
