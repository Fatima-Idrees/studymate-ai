import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadNotes from './pages/UploadNotes';
import NotesLibrary from './pages/NotesLibrary';
import Summary from './pages/Summary';
import ChatWithNotes from './pages/ChatWithNotes';
import Quiz from './pages/Quiz';
import Flashcards from './pages/Flashcards';
import RevisionNotes from './pages/RevisionNotes';
import Progress from './pages/Progress';
import Profile from './pages/Profile';

/** Redirects an already-authenticated user away from auth pages. */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

/**
 * Root element for the data router. AuthProvider and Toaster live here
 * so every route (including ProtectedRoute/PublicOnlyRoute, which call
 * useAuth) renders inside the provider.
 */
function RootProviders() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '8px',
          },
          success: { iconTheme: { primary: '#15803d', secondary: 'white' } },
          error: { iconTheme: { primary: '#b91c1c', secondary: 'white' } },
        }}
      />
      <Outlet />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <Dashboard />, handle: { title: 'Dashboard' } },
              { path: '/upload', element: <UploadNotes />, handle: { title: 'Upload Notes' } },
              { path: '/notes', element: <NotesLibrary />, handle: { title: 'Notes Library' } },
              { path: '/summary', element: <Summary />, handle: { title: 'Summary' } },
              { path: '/chat', element: <ChatWithNotes />, handle: { title: 'Chat with Notes' } },
              { path: '/quiz', element: <Quiz />, handle: { title: 'Quiz' } },
              { path: '/flashcards', element: <Flashcards />, handle: { title: 'Flashcards' } },
              { path: '/revision', element: <RevisionNotes />, handle: { title: 'Revision Notes' } },
              { path: '/progress', element: <Progress />, handle: { title: 'Progress' } },
              { path: '/profile', element: <Profile />, handle: { title: 'Profile' } },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
