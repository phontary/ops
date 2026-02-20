import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Layout() {
  const { logout, user } = useAuth();
  const { lang, t, toggleLang } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-medical-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">OPs</h1>
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded transition ${
                  location.pathname === '/dashboard'
                    ? 'bg-white text-medical-blue'
                    : 'hover:bg-medical-dark'
                }`}
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/stats"
                className={`px-4 py-2 rounded transition ${
                  location.pathname === '/stats'
                    ? 'bg-white text-medical-blue'
                    : 'hover:bg-medical-dark'
                }`}
              >
                {t('statistics')}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLang}
              className="px-3 py-1 bg-white text-medical-blue rounded hover:bg-gray-100 transition font-medium"
            >
              {lang === 'de' ? 'EN' : 'DE'}
            </button>
            <span className="text-sm">{user?.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>Dr. Mohamed Sabry, Alsfeld Hessen</p>
        </div>
      </footer>
    </div>
  );
}
