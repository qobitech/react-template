import NotesApp from './pages/note-app'
import './index.css'
import { DBContext } from './context/db'
import { useSync } from './hook'
import { ITodos } from './interface'
import { v4 as uuidv4 } from 'uuid'

export const defaultNote: Omit<ITodos, 'id'> = {
  text: '',
  title: '',
  timeStamp: Date.now(),
  todo: []
}

const App = () => {
  const dbProps = useSync<ITodos>({ ...defaultNote, id: uuidv4() }) // Custom hook to manage offline storage
  return (
    <div>
      <DBContext.Provider value={{ ...dbProps }}>
        <NotesApp />
      </DBContext.Provider>
    </div>
  )
}

export default App
