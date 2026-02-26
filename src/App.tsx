import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Login } from './pages/Login';
import { Workouts } from './pages/Workouts';
import { HistoryDetail } from './pages/HistoryDetail';
import { Schedule } from './pages/Schedule';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes inside Main Layout */}
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workouts/:date" element={<Workouts />} />
              <Route path="/history/:date" element={<HistoryDetail />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={
                <div className="glass-panel flex-center" style={{ padding: '3rem', margin: 'auto', textAlign: 'center', minHeight: '300px' }}>
                  <div>
                    <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Coming Soon</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>This section is currently under construction.</p>
                  </div>
                </div>
              } />
            </Route>
          </Routes>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;
