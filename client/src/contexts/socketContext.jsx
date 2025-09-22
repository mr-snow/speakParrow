// contexts/socketContext.jsx - EXPAND existing context
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null); // Add userId state here
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userId) {
      console.log('Creating socket connection for user:', userId);
      const newSocket = io('http://localhost:3000', {
        query: { userId },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
      });

      newSocket.on('disconnect', reason => {
        console.log('Socket disconnected. Reason:', reason);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [userId]);

  // Provide everything in one context
  const value = {
    socket,
    userId,
    setUserId,
    isConnected,
    setIsConnected,
  };
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
