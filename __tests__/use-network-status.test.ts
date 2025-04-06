import { renderHook } from '@testing-library/react-hooks'
import { act } from 'react'
import { useNetworkStatus } from '../src/hook'

describe('useNetworkStatus hook', () => {
  beforeEach(() => {
    // Reset navigator.onLine before each test
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => true
    })
  })

  it('should return true when online', () => {
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(true)
  })

  it('should return false when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => false
    })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(false)
  })

  it('should update status when going offline', () => {
    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current).toBe(false)
  })

  it('should update status when going online', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => false
    })

    const { result } = renderHook(() => useNetworkStatus())

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current).toBe(true)
  })
})
