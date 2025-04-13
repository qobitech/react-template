import { createContext, useContext } from 'react'
import { IUseSync } from '../hook'
import { ITodos } from '../interface'

export type themeType = 'dark' | 'light'

export const DBContext = createContext<IUseSync<ITodos> | null>(null)

export const useDBContext = (): IUseSync<ITodos> => {
  const dbContext = useContext(DBContext)
  if (!dbContext) {
    throw new Error('useGlobalContext must be used within a GlobalProvider')
  }
  return {
    ...dbContext
  }
}
