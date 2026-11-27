import { describe, expect, it } from 'vitest'
import { celularEscondido, celularValido, mascaraCelular } from './telefone'

describe('celular', () => {
  it('aceita celular com DDD, com e sem máscara e com 55', () => { for (const t of ['11912345678', '(11) 91234-5678', '+55 11 91234-5678', '5521998765432']) expect(celularValido(t)).toBe(true) })
  it('recusa o que não é celular', () => { for (const t of ['', '123', '1191234567', '(11) 31234-5678', '(00) 91234-5678', '119123456789', 'abcdefghijk']) expect(celularValido(t)).toBe(false) })
  it('máscara enquanto digita', () => { expect(mascaraCelular('1')).toBe('1'); expect(mascaraCelular('119')).toBe('(11) 9'); expect(mascaraCelular('11912345678')).toBe('(11) 91234-5678'); expect(mascaraCelular('+5511912345678')).toBe('(11) 91234-5678') })
  it('esconde o miolo do número', () => { expect(celularEscondido('+5511912345678')).toBe('(11) 9****-5678'); expect(celularEscondido('')).toBe('') })
})
