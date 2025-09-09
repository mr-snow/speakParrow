import './App.css';
import { lazy, Suspense, useEffect } from 'react';

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import { useThemeStore } from './store/themeStore';
import LoadSpinner from './components/commonComponents/spinner/spinner';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const ResultPage = lazy(() => import('./pages/ResultPage/ResultPage'));
const SignupPage = lazy(() => import('./pages/Signup/SignupPage'));
const Lobby = lazy(() => import('./pages/lobby/lobby'));
const Room = lazy(() => import('./pages/Room/room'));

function App() {
  const { appTheme } = useThemeStore();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);
  return (
    <>
      <Suspense
        fallback={
          <div className="bg-black flex justify-center items-center h-screen">
            <LoadSpinner type="parrot" />;
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/test" element={<ResultPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<SignupPage />} />
          <Route
            path="/room"
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ResultPage
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                backLink={-1}
                backPage="Back"
              />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
export default App;
