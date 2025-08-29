import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';
import Lobby from './pages/lobby/lobby';
import Room from './pages/Room/room';

import { useEffect } from 'react';

import { useThemeStore } from './store/themestore';
import SignupPage from './pages/Signup/SignupPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ResultPage from './pages/ResultPage/ResultPage';

function App() {
  const { appTheme } = useThemeStore();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/room" element={<Room />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SignupPage />} />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <ResultPage />  
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
    </>
  );
}
export default App;
