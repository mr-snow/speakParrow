import './App.css';
import { lazy, Suspense, useEffect, useState } from 'react';

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import { useThemeStore } from './store/themeStore';
import LoadSpinner from './components/commonComponents/spinner/spinner';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AuthDebugInfo from './contexts/authDebugInfo';

const ResultPage = lazy(() => import('./pages/ResultPage/ResultPage'));
const SignupPage = lazy(() => import('./pages/Signup/SignupPage'));
const Lobby = lazy(() => import('./pages/lobby/lobby'));
const Room = lazy(() => import('./pages/Room/room'));
const RoomList = lazy(() => import('./components/TestComponent/RoomList'));

function App() {
  const { appTheme } = useThemeStore();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);
  const [userId, setUserId] = useState(null);
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
            path="/testroom"
            element={<RoomList setGlobalUserId={setUserId} />}
          />
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
