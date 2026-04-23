import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OAuth2CallbackPage from './pages/OAuth2CallbackPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import TechnicianDashboard from './pages/TechnicianDashboard'
import NewIncidentPage from './pages/NewIncidentPage'
import EditProfilePage from './pages/EditProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRedirect from './components/RoleRedirect'
import ResourceListPage from './pages/ResourceListPage'
import AddResourcePage from './pages/AddResourcePage'
import ResourceAvailabilityPage from './pages/ResourceAvailabilityPage'
import CreateBookingPage from './pages/CreateBookingPage'
import MyBookingsPage from './pages/MyBookingsPage'
import AdminBookingsPage from './pages/AdminBookingsPage'
import BookingDetailsPage from './pages/BookingDetailsPage'
import EditBookingPage from './pages/EditBookingPage'
import BookingCheckInPage from './pages/BookingCheckInPage'
import ResourceDetailPage from './pages/ResourceDetailPage'
import UserResourcePage from './pages/UserResourcePage'
import EditResourcePage from './pages/EditResourcePage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

      {/* Role-based redirect from / */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Resource Routes - accessible by all logged in users */}
      <Route path="/resources" element={
        <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
          <UserResourcePage />
        </ProtectedRoute>
      } />
      <Route path="/resources/new" element={
        <ProtectedRoute roles={['ADMIN']}>
          <AddResourcePage />
        </ProtectedRoute>
      } />
      <Route path="/resources/:id" element={
        <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
          <ResourceDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/resources/edit/:id" element={
        <ProtectedRoute roles={['ADMIN']}>
          <EditResourcePage />
        </ProtectedRoute>
      } />
      <Route path="/resources/:id/availability" element={
        <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
          <ResourceAvailabilityPage />
        </ProtectedRoute>
      } />

      {/* Admin resource management */}
      <Route path="/admin/resources" element={
        <ProtectedRoute roles={['ADMIN']}>
          <ResourceListPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/resources/add" element={
        <ProtectedRoute roles={['ADMIN']}>
          <AddResourcePage />
        </ProtectedRoute>
      } />
      <Route path="/admin/resources/edit/:id" element={
        <ProtectedRoute roles={['ADMIN']}>
          <EditResourcePage />
        </ProtectedRoute>
      } />

      {/* Booking Routes */}
      <Route path="/bookings/create" element={
        <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
          <CreateBookingPage />
        </ProtectedRoute>
      } />
      <Route path="/bookings/my" element={
        <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
          <MyBookingsPage />
        </ProtectedRoute>
      } />
      <Route path="/bookings/:id" element={
        <ProtectedRoute roles={['USER', 'ADMIN']}>
          <BookingDetailsPage />
        </ProtectedRoute>
      } />
      <Route path="/bookings/:id/edit" element={
        <ProtectedRoute roles={['USER', 'ADMIN']}>
          <EditBookingPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute roles={['ADMIN']}>
          <AdminBookingsPage />
        </ProtectedRoute>
      } />

      <Route path="/bookings/checkin" element={
        <ProtectedRoute roles={['ADMIN', 'TECHNICIAN']}>
          <BookingCheckInPage />
        </ProtectedRoute>
      } />

      {/* Dashboard Routes */}
      <Route path="/dashboard/user" element={
        <ProtectedRoute roles={['USER']}>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/user/report-incident" element={
        <ProtectedRoute roles={['USER']}>
          <NewIncidentPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/admin" element={
        <ProtectedRoute roles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/technician" element={
        <ProtectedRoute roles={['TECHNICIAN']}>
          <TechnicianDashboard />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute roles={['USER', 'ADMIN', 'TECHNICIAN']}>
          <EditProfilePage />
        </ProtectedRoute>
      } />

      {/* Catch-all → role redirect */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}

export default App
