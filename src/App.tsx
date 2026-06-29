import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/store'
import { AuthProvider } from './store/auth'
import { ToastProvider } from './components/Toast'
import { RequireAuth } from './components/RequireAuth'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Inventory } from './pages/Inventory'
import { AddProduct } from './pages/AddProduct'
import { Scan } from './pages/Scan'
import { History } from './pages/History'
import { Reports } from './pages/Reports'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route
                element={
                  <RequireAuth>
                    <Layout />
                  </RequireAuth>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="add" element={<AddProduct />} />
                <Route path="scan" element={<Scan />} />
                <Route path="sales" element={<History />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
