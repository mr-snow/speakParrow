import React from 'react';
import { authStore } from '../../store/authStore';
import { useState } from 'react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = authStore();
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAuthenticated();
      console.log('Test-auth:', result);
      setAuth(result);
    };
    checkAuth();
  }, [isAuthenticated]);

if (auth == null) {
    return <div>Loading...</div>;
  }

  return auth ? <>{children}</> : <h2>Nothing</h2>;
}

export default ProtectedRoute;
