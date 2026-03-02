import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import ContractsPage from './pages/ContractsPage'
import WarehousePage from './pages/WarehousePage'
import ProcurementPage from './pages/ProcurementPage'
import ProductionPage from './pages/ProductionPage'
import TasksPage from './pages/TasksPage'
import RequestsPage from './pages/RequestsPage'
import ChatPage from './pages/ChatPage'
import NotificationsPage from './pages/NotificationsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import UsersPage from './pages/UsersPage'
import DirectoriesPage from './pages/DirectoriesPage'
import TechSpecsPage from './pages/TechSpecsPage'
import PermissionsPage from './pages/PermissionsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="warehouse" element={<WarehousePage />} />
        <Route path="procurement" element={<ProcurementPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="directories" element={<DirectoriesPage />} />
        <Route path="tech-specs" element={<TechSpecsPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
