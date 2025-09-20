// // RoomList.js - Fixed version
// import { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import VideoCall from './VideoCall';
// import Chat from './chat';
// import './roomlist.css';

// const RoomList = () => {
//   const [roomId, setRoomId] = useState('');
//   const [userId, setUserId] = useState('');
//   const [joined, setJoined] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const [isVideoActive, setIsVideoActive] = useState(true);
//   const [isAudioActive, setIsAudioActive] = useState(true);
//   const [connectionError, setConnectionError] = useState('');

//   useEffect(() => {
//     // Generate a random user ID if not set
//     if (!userId) {
//       setUserId(`user-${Math.random().toString(36).substr(2, 9)}`);
//     }

//     // Generate a random room ID if not set
//     if (!roomId) {
//       setRoomId(`room-${Math.random().toString(36).substr(2, 9)}`);
//     }
//   }, []);

//   const joinRoom = () => {
//     if (roomId.trim() && userId.trim()) {
//       setConnectionError('');
//       try {
//         // Connect to the correct server port (changed to 3000 as mentioned in error)
//         const newSocket = io('http://localhost:3000', {
//           transports: ['websocket', 'polling'],
//           withCredentials: true,
//           query: {
//             userId: userId,
//             roomId: roomId,
//           },
//         });

//         newSocket.on('connect', () => {
//           console.log('Connected to server');
//           setSocket(newSocket);
//           setJoined(true);
//           // Join room after connection is established
//           newSocket.emit('join-room', roomId, userId);
//         });

//         newSocket.on('connect_error', error => {
//           console.error('Connection error:', error);
//           setConnectionError(
//             `Connection error: ${error.message}. Make sure the backend is running on port 3000.`
//           );
//         });
//       } catch (error) {
//         console.error('Error creating socket connection:', error);
//         setConnectionError('Failed to create connection. Please try again.');
//       }
//     }
//   };

//   const leaveRoom = () => {
//     if (socket) {
//       socket.emit('leave-room', roomId, userId);
//       socket.disconnect();
//       setSocket(null);
//     }
//     setJoined(false);
//   };

//   const copyToClipboard = text => {
//     navigator.clipboard.writeText(text);
//     alert(`${text} copied to clipboard!`);
//   };

//   return (
//     <div className="room-container">
//       <header className="room-header">
//         <h1>WebRTC Video Call Room</h1>
//         {connectionError && (
//           <div className="error-message">{connectionError}</div>
//         )}
//         {joined && (
//           <div className="room-info">
//             <div>
//               <span>Room ID: {roomId}</span>
//               <button onClick={() => copyToClipboard(roomId)}>Copy</button>
//             </div>
//             <div>
//               <span>Your ID: {userId}</span>
//               <button onClick={() => copyToClipboard(userId)}>Copy</button>
//             </div>
//           </div>
//         )}
//       </header>

//       {!joined ? (
//         <div className="join-section">
//           <div className="join-form">
//             <h2>Join a Video Call Room</h2>
//             <div className="form-group">
//               <label htmlFor="userId">Your Name</label>
//               <input
//                 id="userId"
//                 type="text"
//                 value={userId}
//                 onChange={e => setUserId(e.target.value)}
//                 placeholder="Enter your name"
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="roomId">Room ID</label>
//               <input
//                 id="roomId"
//                 type="text"
//                 value={roomId}
//                 onChange={e => setRoomId(e.target.value)}
//                 placeholder="Enter room ID"
//               />
//             </div>
//             <button onClick={joinRoom} className="join-button">
//               Join Room
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="room-content">
//           <div className="main-content">
//             <VideoCall
//               socket={socket}
//               roomId={roomId}
//               userId={userId}
//               isVideoActive={isVideoActive}
//               isAudioActive={isAudioActive}
//             />

//             <div className="media-controls">
//               <button
//                 onClick={() => setIsVideoActive(!isVideoActive)}
//                 className={
//                   isVideoActive ? 'control-active' : 'control-inactive'
//                 }
//               >
//                 {isVideoActive ? 'Video On' : 'Video Off'}
//               </button>
//               <button
//                 onClick={() => setIsAudioActive(!isAudioActive)}
//                 className={
//                   isAudioActive ? 'control-active' : 'control-inactive'
//                 }
//               >
//                 {isAudioActive ? 'Audio On' : 'Audio Off'}
//               </button>
//               <button onClick={leaveRoom} className="leave-button">
//                 Leave Room
//               </button>
//             </div>
//           </div>

//           <div className="chat-sidebar">
//             <Chat socket={socket} roomId={roomId} userId={userId} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoomList;
