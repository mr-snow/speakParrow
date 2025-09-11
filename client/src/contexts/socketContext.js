import { createContext, useContext, useEffect, useState } from 'react';
import { authStore } from '../store/authStore';
import { io } from 'socket.io-client';
const API_URL = import.meta.env.VITE_API_URL;
const baseUrl = API_URL.replace('/api/', '');

const SocketContext = createContext();
export const useSocket = () => {
  return useContext(SocketContext)};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user_id } = authStore();

  useEffect(() => {
    if (user_id) {
      const newSocket = io(baseUrl, {
        query: {
          userId: user_id,},
      });
      setSocket(newSocket);
      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user_id]);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
