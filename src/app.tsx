import NotesApp from './pages/note-app'
import './index.css'
import { DBContext } from './context/db'
import { useSync } from './hook'
import { ITodos } from './interface'

const App = () => {
  const dbProps = useSync<ITodos>() // Custom hook to manage offline storage
  return (
    <div>
      <DBContext.Provider value={{ ...dbProps }}>
        <NotesApp />
      </DBContext.Provider>
    </div>
  )
}

export default App
