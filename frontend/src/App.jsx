import AppRoutes from './routes/AppRoutes.jsx'
import { ConfirmProvider } from './components/ConfirmDialog/ConfirmDialog.jsx'

export default function App() {
  return <ConfirmProvider><AppRoutes /></ConfirmProvider>
}
