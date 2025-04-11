import { INote } from './pages/note-app'

export interface TodoExportFormat {
  formatSignature: string
  metadata: {
    version: string
    createdAt: string
    appIdentifier: string
    appVersion: string
    exportId: string
    userFingerprint: string
    contentChecksum?: string
  }
  todos: INote[]
  visualSignature: string
}
