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
  todo: ITodos
  visualSignature: string
}

export interface ITodos {
  id: string
  text: string
  title: string
  timeStamp: number
  todo: ITodo[]
}

export type todoStatusType =
  | 'completed'
  | 'not-started'
  | 'in-progress'
  | 'blocked'

export interface ITodo {
  id: string
  subject: string
  status: todoStatusType
}
