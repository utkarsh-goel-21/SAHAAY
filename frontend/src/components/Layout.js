import { useAuth } from '../utils/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Sahaay
            </Link>

            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>

              {user ? (
                <>
                  {user.role === 'citizen' && (
                    <Link href="/report-issue" className="text-gray-700 hover:text-primary-600">
                      Report Issue
                    </Link>
                  )}

                  {user.role === 'volunteer' && (
                    <Link href="/volunteer" className="text-gray-700 hover:text-primary-600">
                      Volunteer
                    </Link>
                  )}

                  {user.role === 'sponsor' && (
                    <Link href="/sponsor" className="text-gray-700 hover:text-primary-600">
                      Sponsor
                    </Link>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500 text-xs capitalize">{user.role}</div>
                    </div>
                    <button onClick={logout} className="btn btn-secondary text-sm">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link href="/login" className="btn btn-secondary">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Sahaay - Civic Problem Reporting Platform</p>
          <p className="text-sm text-gray-400 mt-2">
            Transforming citizen complaints into community action
          </p>
        </div>
      </footer>
    </div>
  );
}
