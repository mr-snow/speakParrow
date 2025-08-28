import React from 'react';
import { authStore } from '../../store/authStore';
import { useState } from 'react';
import { useEffect } from 'react';
import { message, Spin } from 'antd';
import LoadSpinner from '../commonComponents/spinner/spinner';
import { Navigate } from 'react-router-dom';

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
        setValidToken(result);
        console.log('Test-auth:', result);
        setIsValidating(false);
      } catch (error) {
        setIsValidating(false);
        message.error(error.message || error);
      } finally {
        setIsValidating(false);
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

  return isValidToken ? <>{children}</> : <Navigate to="/login" />;
}

export default ProtectedRoute;
