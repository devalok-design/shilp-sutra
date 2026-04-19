import { describe, expect,it } from 'vitest'

import { toast } from './use-toast'

describe('use-toast', () => {
  it('exports toast as a function', () => {
    expect(typeof toast).toBe('function')
  })

  it('toast has success method', () => {
    expect(typeof toast.success).toBe('function')
  })

  it('toast has error method', () => {
    expect(typeof toast.error).toBe('function')
  })

  it('toast has warning method', () => {
    expect(typeof toast.warning).toBe('function')
  })

  it('toast has info method', () => {
    expect(typeof toast.info).toBe('function')
  })

  it('toast has loading method', () => {
    expect(typeof toast.loading).toBe('function')
  })

  it('toast has promise method', () => {
    expect(typeof toast.promise).toBe('function')
  })

  it('toast has dismiss method', () => {
    expect(typeof toast.dismiss).toBe('function')
  })
})
