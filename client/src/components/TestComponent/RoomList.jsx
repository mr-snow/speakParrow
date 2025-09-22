import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/socketContext';
import { authStore } from '../../store/authStore';
import VideoCall from './VideoCall';
import Chat from './Chat';
import './RoomList.css';

const RoomList = () => {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const { socket, setUserId, isConnected } = useSocket();
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [isAudioActive, setIsAudioActive] = useState(true);
  const [connectionError, setConnectionError] = useState('');
  const [inputUserId, setInputUserId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Use ref to track if we've set up listeners
  const listenersSetRef = useRef(false);

  const { username, setRoomId: setStoreRoomId, removeRoomId } = authStore();

  useEffect(() => {
    if (!roomId) {
      const newRoomId = `room-${Math.random().toString(36).substr(2, 9)}`;
      setRoomId(newRoomId);
    }
  }, []);

  // Listen for socket connection changes
  useEffect(() => {
    if (isConnected && socket && isConnecting && !listenersSetRef.current) {
      // Socket is connected, proceed with join room
      proceedWithJoinRoom();
    }
  }, [isConnected, socket, isConnecting]);

  const joinRoom = () => {
    if (roomId.trim() && inputUserId) {
      setConnectionError('');
      setIsConnecting(true);
      listenersSetRef.current = false;

      try {
        // Set the user ID in context - this will trigger socket connection
        setUserId(inputUserId);

        // Set timeout for connection 
        setTimeout(() => {
          if (!isConnected && isConnecting) {
            setConnectionError('Socket connection timeout. Please try again.');
            setIsConnecting(false);
          }
        }, 5000);
      } catch (error) {
        console.error('Error joining room:', error);
        setConnectionError('Failed to join room. Please try again.');
        setIsConnecting(false);
      }
    } else {
      setConnectionError('Please enter both User ID and Room ID');
    }
  };

  const proceedWithJoinRoom = () => {
    if (!socket || listenersSetRef.current) return;

    listenersSetRef.current = true;

    try {
      // Update room ID in auth store
      setStoreRoomId(roomId);

      // Set up join room listeners
      socket.once('join-room-success', data => {
        console.log('Successfully joined room:', data);
        setJoined(true);
        setIsConnecting(false);
      });

      socket.once('join-room-error', error => {
        console.error('Failed to join room:', error);
        setConnectionError(error.message || 'Failed to join room');
        setIsConnecting(false);
      });

      // Emit join-room event to server
      socket.emit('join-room', {
        roomId,
        userId: inputUserId,
        username: username || `User-${inputUserId}`,
      });

      // Set timeout for join operation
      setTimeout(() => {
        if (!joined && !connectionError && isConnecting) {
          setConnectionError('Join operation timed out');
          setIsConnecting(false);
        }
      }, 5000);
    } catch (error) {
      console.error('Error in join room process:', error);
      setConnectionError('Failed to join room. Please try again.');
      setIsConnecting(false);
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', roomId, inputUserId);
    }
    // Remove room ID from auth store
    removeRoomId();
    setJoined(false);
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    alert(`${text} copied to clipboard!`);
  };

  return (
    <div className="room-container">
      <header className="room-header">
        <h1>WebRTC Video Call Room</h1>
        {connectionError && (
          <div className="error-message">{connectionError}</div>
        )}
        {joined && (
          <div className="room-info">
            <div>
              <span>Room ID: {roomId}</span>
              <button onClick={() => copyToClipboard(roomId)}>Copy</button>
            </div>
            <div>
              <span>Your ID: {inputUserId}</span>
              <button onClick={() => copyToClipboard(inputUserId)}>Copy</button>
            </div>
          </div>
        )}
      </header>

      {!joined ? (
        <div className="join-section">
          <div className="join-form">
            <h2>Join a Video Call Room</h2>
            <div className="form-group">
              <label htmlFor="userId">Your User ID</label>
              <input
                id="userId"
                type="text"
                value={inputUserId}
                onChange={e => setInputUserId(e.target.value)}
                placeholder="Enter your user ID"
                disabled={isConnecting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="roomId">Room ID</label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                disabled={isConnecting}
              />
            </div>
            <button
              onClick={joinRoom}
              className="join-button"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Join Room'}
            </button>
          </div>
        </div>
      ) : (
        <div className="room-content">
          <div className="main-content">
            <VideoCall
              socket={socket}
              roomId={roomId}
              userId={inputUserId}
              isVideoActive={isVideoActive}
              isAudioActive={isAudioActive}
            />

            <div className="media-controls">
              <button
                onClick={() => setIsVideoActive(!isVideoActive)}
                className={
                  isVideoActive ? 'control-active' : 'control-inactive'
                }
              >
                {isVideoActive ? 'Video On' : 'Video Off'}
              </button>
              <button
                onClick={() => setIsAudioActive(!isAudioActive)}
                className={
                  isAudioActive ? 'control-active' : 'control-inactive'
                }
              >
                {isAudioActive ? 'Audio On' : 'Audio Off'}
              </button>
              <button onClick={leaveRoom} className="leave-button">
                Leave Room
              </button>
            </div>
          </div>

          <div className="chat-sidebar">
            <Chat
              socket={socket}
              roomId={roomId}
              userId={inputUserId}
              username={username || `User-${inputUserId}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
