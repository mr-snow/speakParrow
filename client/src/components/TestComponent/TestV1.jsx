import React, { useState, useEffect, useRef } from 'react';
import './video.css';

const VideoCall = ({
  socket,
  roomId,
  userId,
  isVideoActive,
  isAudioActive,
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [remoteUser, setRemoteUser] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize media and socket listeners
  useEffect(() => {
    if (socket && roomId && userId) {
      initializeMedia();
      initializeSocketListeners();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [socket, roomId, userId]);

  // Update media tracks when toggled
  useEffect(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = isVideoActive;
      }

      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = isAudioActive;
      }
    }
  }, [isVideoActive, isAudioActive, localStream]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setConnectionStatus('ready');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('error');
    }
  };

  const initializeSocketListeners = () => {
    if (!socket) return;

    socket.on('user-connected', handleUserConnected);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-disconnected', handleUserDisconnected);
  };

  const createPeerConnection = () => {
    try {
      const pc = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle remote stream
      pc.ontrack = event => {
        console.log('Received remote stream');
        const remoteStream = event.streams[0];
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setConnectionStatus('connected');
      };

      // Handle ICE candidates
      pc.onicecandidate = event => {
        if (event.candidate && remoteUser) {
          console.log('Sending ICE candidate');
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            roomId: roomId,
            targetUserId: remoteUser,
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        setConnectionStatus(pc.iceConnectionState);

        if (
          pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed' ||
          pc.iceConnectionState === 'closed'
        ) {
          setRemoteStream(null);
          setRemoteUser(null);
        }
      };

      peerConnection.current = pc;
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      setConnectionStatus('error');
      return null;
    }
  };

  const handleUserConnected = async remoteUserId => {
    console.log('User connected:', remoteUserId);
    if (remoteUserId !== userId) {
      setRemoteUser(remoteUserId);
      const pc = createPeerConnection();

      if (!pc) return;

      try {
        console.log('Creating offer');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('offer', {
          offer: offer,
          roomId: roomId,
          targetUserId: remoteUserId,
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

const handleOffer = async data => {
  addDebugLog('Received offer', {
    senderId: data.senderId,
    targetUserId: data.targetUserId,
    roomId: data.roomId
  });

  // FIXED: Check if the offer is for this user
  if (data.targetUserId !== userId || remoteUser) {
    addDebugLog('Ignoring offer - not for this user or already connected', {
      isForThisUser: data.targetUserId === userId,
      hasRemoteUser: !!remoteUser
    });
    return;
  }

  setRemoteUser(data.senderId);
  const pc = createPeerConnection();

  try {
    addDebugLog('Setting remote description from offer');
    await pc.setRemoteDescription(data.offer);
    addDebugLog('Set remote description successfully');

    const answer = await pc.createAnswer();
    addDebugLog('Created answer', { type: answer.type });

    await pc.setLocalDescription(answer);
    addDebugLog('Set local description for answer');

    // FIXED: Use the original offer sender's user ID
    socket.emit('answer', {
      answer,
      roomId: data.roomId || roomId, // Use the roomId from offer or current room
      targetUserId: data.senderId // This should be the user ID who sent the offer
    });

    addDebugLog('Emitted answer to sender', { targetUserId: data.senderId });
  } catch (err) {
    console.error('Offer handling error:', err);
    addDebugLog('Error handling offer', err);
  }
};

  const handleAnswer = async data => {
    addDebugLog('Received answer', {
      senderId: data.senderId,
      targetUserId: data.targetUserId,
      answerType: data.answer.type,
      roomId: data.roomId,
    });

    // FIXED: Check if the answer is for this user (using userId, not socket ID)
    if (data.targetUserId !== userId || !peerConnection.current) {
      addDebugLog('Ignoring answer - not for this user or no peer connection', {
        isForThisUser: data.targetUserId === userId,
        hasPeerConnection: !!peerConnection.current,
        expectedUserId: userId,
        receivedTargetUserId: data.targetUserId,
      });
      return;
    }

    try {
      addDebugLog('Setting remote description from answer');
      await peerConnection.current.setRemoteDescription(data.answer);
      addDebugLog('Successfully set remote description from answer');
    } catch (err) {
      console.error('Answer handling error:', err);
      addDebugLog('Error handling answer', err);
    }
  };

const handleIceCandidate = async data => {
  addDebugLog('Received ICE candidate', {
    senderId: data.senderId,
    targetUserId: data.targetUserId,
    roomId: data.roomId
  });

  // FIXED: Check if the ICE candidate is for this user
  if (data.targetUserId !== userId || !peerConnection.current) {
    addDebugLog('Ignoring ICE candidate - not for this user or no peer connection', {
      isForThisUser: data.targetUserId === userId,
      hasPeerConnection: !!peerConnection.current
    });
    return;
  }

  try {
    addDebugLog('Adding ICE candidate');
    await peerConnection.current.addIceCandidate(data.candidate);
    addDebugLog('Successfully added ICE candidate');
  } catch (err) {
    console.error('ICE error:', err);
    addDebugLog('Error adding ICE candidate', err);
  }
};

  const handleUserDisconnected = remoteUserId => {
    console.log('User disconnected:', remoteUserId);
    if (remoteUserId === remoteUser) {
      setRemoteStream(null);
      setRemoteUser(null);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      setConnectionStatus('disconnected');
    }
  };

  return (
    <div className="video-call-container">
      <div className="video-container">
        <div className="remote-video-wrapper">
          <div className="video-title">Remote Video</div>
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
          ) : (
            <div className="waiting-remote">
              <p>Waiting for another participant to join...</p>
              <p>
                Share the room ID: <strong>{roomId}</strong>
              </p>
              {connectionStatus !== 'disconnected' && (
                <p className="status-text">Status: {connectionStatus}</p>
              )}
            </div>
          )}
        </div>

        <div className="local-video-wrapper">
          <div className="video-title">Your Video</div>
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="local-video"
            />
          ) : (
            <div className="waiting-local">
              <p>Initializing camera...</p>
            </div>
          )}
        </div>
      </div>

      <div className="connection-status">
        <span className="status-label">Status:</span>
        <span className={`status-value ${connectionStatus}`}>
          {connectionStatus}
        </span>
        {remoteUser && (
          <span className="remote-user">Connected to: {remoteUser}</span>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
