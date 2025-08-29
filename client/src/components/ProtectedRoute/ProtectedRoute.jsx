import React from 'react';
import { authStore } from '../../store/authStore';
import { useState } from 'react';
import { useEffect } from 'react';
import { message, Spin } from 'antd';
import LoadSpinner from '../commonComponents/spinner/spinner';
import { Navigate } from 'react-router-dom';
import ResultPage from '../../pages/ResultPage/ResultPage';

function ProtectedRoute({ children }) {
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setValidToken] = useState(false);
  const { validateToken, token } = authStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }
      try {
        const result = await validateToken();
        setTimeout(() => {
          setValidToken(result);
          setIsValidating(false);
        }, 2000);
      } catch (error) {
        setIsValidating(false);
        message.error(error.message || error);
      }
    };
    checkAuth();
  }, [validateToken, token]);

  if (isValidating) {
    return (
      <div className="bg-black flex justify-center items-center h-screen">
        <LoadSpinner type="parrot" />;
      </div>
    );
  }

  return isValidToken ? (
    <>{children}</>
  ) : (
    <ResultPage
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      backLink={'/login'}
      backPage="Login/SignUp"
    />
  );
}

export default ProtectedRoute;
