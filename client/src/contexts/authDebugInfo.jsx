import React, { useState, createContext, useContext } from 'react';

// Create a context for the debug panel
const DebugContext = createContext();

// Custom hook to use the debug panel
export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

// Debug Provider component
export const DebugProvider = ({ children }) => {
  const [debugData, setDebugData] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const updateDebugData = (key, value) => {
    setDebugData(prev => ({ ...prev, [key]: value }));
  };

  const clearDebugData = () => {
    setDebugData({});
  };

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <DebugContext.Provider value={{ updateDebugData, clearDebugData, debugData }}>
      {children}
      {isVisible && <DebugPanel debugData={debugData} />}
      <button 
        onClick={toggleVisibility}
        className="fixed bottom-5 right-5 bg-gray-800 text-white border-none rounded-full w-12 h-12 cursor-pointer z-50 text-xl flex items-center justify-center"
      >
        {isVisible ? '❌' : '🐞'}
      </button>
    </DebugContext.Provider>
  );
};

// Debug Panel component
const DebugPanel = ({ debugData }) => {
  // Safely handle debugData to prevent Object.keys error
  const data = debugData || {};
  const hasData = Object.keys(data).length > 0;

  return (
    <div className="fixed bottom-20 right-5 bg-gray-900 text-white p-4 rounded-lg text-sm z-40 max-w-sm max-h-96 overflow-auto font-mono border border-gray-700 shadow-xl">
      <div className="font-bold mb-3 border-b border-gray-700 pb-2">
        Debug Information
      </div>
      
      {hasData ? (
        Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-2">
            <span className="text-blue-400">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}
          </div>
        ))
      ) : (
        <div className="text-gray-500">🐞</div>
      )}
    </div>
  );
};

export default DebugPanel;