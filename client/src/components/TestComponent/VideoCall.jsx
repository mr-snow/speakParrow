import { useEffect, useRef, useState } from 'react';
import './video.css';

const VideoCall = ({ socket, roomId, userId, isVideoActive, isAudioActive }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const mediaStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const isOffererRef = useRef(false);
  const pendingRemoteUserId = useRef(null);

  useEffect(() => {
    console.log('VideoCall component mounted', { roomId, userId, hasSocket: !!socket });
    
    if (!socket) {
      console.error('No socket connection available');
      return;
    }

    initializeMedia();
    initializeSocketListeners();

    return () => {
      cleanup();
    };
  }, [socket, roomId, userId]);

  useEffect(() => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = isVideoActive;
        console.log(`Video ${isVideoActive ? 'enabled' : 'disabled'}`);
      }
      
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = isAudioActive;
        console.log(`Audio ${isAudioActive ? 'enabled' : 'disabled'}`);
      }
    }
  }, [isVideoActive, isAudioActive]);

  // Update remote video when remote stream changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      console.log('Remote video source updated with', remoteStreamRef.current.getTracks().length, 'tracks');
    }
  }, [remoteStreamRef.current]);

  const initializeMedia = async () => {
    try {
      console.log('Requesting user media');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('Got user media', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });
      
      console.log('Media initialized successfully');
      
      // If we already have a peer connection, add our stream to it
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
        // Remove existing tracks first
        const senders = peerConnectionRef.current.getSenders();
        senders.forEach(sender => {
          if (sender.track && sender.track.kind === 'video') {
            peerConnectionRef.current.removeTrack(sender);
          }
        });
        
        // Add new tracks
        stream.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, stream);
        });
        console.log('Updated peer connection with new media tracks');
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const initializeSocketListeners = () => {
    console.log('Initializing socket listeners');
    
    // User connected - create peer connection
    socket.on('user-connected', (remoteUserId) => {
      console.log('User connected event received', { remoteUserId, currentUserId: userId });
      if (remoteUserId !== userId) { // Don't connect to ourselves
        setRemoteUserId(remoteUserId);
        setConnectionStatus('connecting');
        pendingRemoteUserId.current = remoteUserId;
        createPeerConnection(remoteUserId);
      }
    });

    // User disconnected - cleanup
    socket.on('user-disconnected', (disconnectedUserId) => {
      console.log('User disconnected', { disconnectedUserId });
      if (disconnectedUserId === remoteUserId) {
        setRemoteUserId(null);
        setConnectionStatus('disconnected');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      }
    });

    // Handle incoming offer
    socket.on('offer', async (data) => {
      console.log('Received offer', data);
      
      // Only process if we're the target
      if (data.targetUserId === userId && data.senderId !== userId) {
        try {
          if (!peerConnectionRef.current) {
            await createPeerConnection(data.senderId);
          }
          
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          console.log('Set remote description from offer');
          
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          console.log('Created answer');
          
          // Send answer back to the offerer
          socket.emit('answer', {
            roomId: roomId,
            targetUserId: data.senderId,
            answer: answer
          });
          console.log('Sent answer to', data.senderId);
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      }
    });

    // Handle incoming answer
    socket.on('answer', async (data) => {
      console.log('Received answer', data);
      
      // Only process if we're the target and have a pending offer
      if (data.targetUserId === userId && peerConnectionRef.current && isOffererRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('Set remote description from answer');
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    });

    // Handle incoming ICE candidates
    socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate', data);
      
      // Only process if we're the target
      if (data.targetUserId === userId && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('Added ICE candidate');
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    // Join room after setting up all listeners
    console.log('Emitting join-room event', { roomId, userId });
    socket.emit('join-room', { roomId, userId });
  };

  const createPeerConnection = async (targetUserId) => {
    try {
      console.log('Creating new peer connection for remote user:', targetUserId);
      
      // Close existing connection if any
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add our local media tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, mediaStreamRef.current);
        });
        console.log('Added local tracks to peer connection');
      }

      // Handle remote tracks - CRITICAL FIX
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote tracks - ontrack event fired', event.streams);
        
        if (event.streams && event.streams.length > 0) {
          // Create a new stream and add all tracks
          const newRemoteStream = new MediaStream();
          
          event.streams.forEach(stream => {
            stream.getTracks().forEach(track => {
              newRemoteStream.addTrack(track);
              console.log('Added track to remote stream:', track.kind, track.id);
            });
          });
          
          remoteStreamRef.current = newRemoteStream;
          
          // Update the video element
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
            console.log('Set remote video stream with', remoteStreamRef.current.getTracks().length, 'tracks');
            
            // Force video to play
            remoteVideoRef.current.play().catch(e => {
              console.error('Failed to play remote video:', e);
            });
          }
          
          setConnectionStatus('connected');
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && targetUserId) {
          console.log('New ICE candidate, sending to', targetUserId);
          socket.emit('ice-candidate', {
            roomId: roomId,
            targetUserId: targetUserId,
            candidate: event.candidate
          });
        } else if (!event.candidate) {
          console.log('All ICE candidates have been generated');
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        console.log('Peer connection state changed:', state);
        setConnectionStatus(state);
      };

      // Handle ICE connection state changes
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const state = peerConnectionRef.current.iceConnectionState;
        console.log('ICE connection state changed:', state);
      };

      // Determine who should create the offer
      if (userId && targetUserId) {
        isOffererRef.current = userId < targetUserId;
        console.log('Is offerer:', isOffererRef.current);
        
        if (isOffererRef.current) {
          console.log('We are the initiator, creating offer');
          // Small delay to ensure everything is set up
          setTimeout(() => createOffer(targetUserId), 1000);
        }
      }

    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  };

  const createOffer = async (targetUserId) => {
    try {
      if (!peerConnectionRef.current) {
        console.error('No peer connection to create offer');
        return;
      }

      console.log('Creating offer for', targetUserId);
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('Created offer');

      // Send offer to the remote user
      socket.emit('offer', {
        roomId: roomId,
        targetUserId: targetUserId,
        offer: offer
      });
      console.log('Sent offer to', targetUserId);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const cleanup = () => {
    console.log('Cleaning up VideoCall component');
    
    // Stop media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    // Remove socket listeners
    if (socket) {
      socket.off('user-connected');
      socket.off('user-disconnected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    }
    
    setRemoteUserId(null);
    setConnectionStatus('disconnected');
    isOffererRef.current = false;
    pendingRemoteUserId.current = null;
  };

  // Function to retry media initialization
  const retryMedia = async () => {
    console.log('Retrying media initialization');
    await initializeMedia();
  };

  // Function to manually create offer (for debugging)
  const manualCreateOffer = () => {
    if (pendingRemoteUserId.current) {
      console.log('Manually creating offer for', pendingRemoteUserId.current);
      createOffer(pendingRemoteUserId.current);
    }
  };

  // Function to manually set remote description (for debugging)
  const manualSetRemoteDescription = () => {
    if (peerConnectionRef.current) {
      console.log('Manually checking remote description');
      console.log('Current remote description:', peerConnectionRef.current.remoteDescription);
      console.log('Current local description:', peerConnectionRef.current.localDescription);
    }
  };

  // In your VideoCall component, add this useEffect
useEffect(() => {
  if (!socket) return;

  const handleConnect = () => {
    console.log('Socket reconnected, rejoining room');
    socket.emit('join-room', { roomId, userId });
  };

  socket.on('connect', handleConnect);

  return () => {
    socket.off('connect', handleConnect);
  };
}, [socket, roomId, userId]);

  return (
    <div className="video-call-container">
      <div className="video-wrapper">
        <div className="video-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
            onLoadedMetadata={() => console.log('Local video metadata loaded')}
            onCanPlay={() => console.log('Local video can play')}
          />
          <div className="video-overlay">You ({userId.substring(0, 8)}...)</div>
        </div>
        
        <div className="video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
            onLoadedMetadata={() => console.log('Remote video metadata loaded')}
            onCanPlay={() => console.log('Remote video can play')}
            onError={(e) => console.error('Remote video error:', e)}
          />
          <div className="video-overlay">
            {remoteUserId 
              ? `Remote User (${connectionStatus})` 
              : 'Waiting for connection...'
            }
          </div>
        </div>
      </div>
      
      <div className="connection-status">
        Status: {connectionStatus}
        {remoteUserId && ` | Connected to: ${remoteUserId.substring(0, 8)}...`}
      </div>
      
      <div className="debug-info">
        <p>Room: {roomId}</p>
        <p>Your ID: {userId}</p>
        <p>Remote ID: {remoteUserId || 'None'}</p>
        <p>Remote Video: {remoteVideoRef.current?.srcObject ? 'Ready' : 'No stream'}</p>
        <p>Local Video: {localVideoRef.current?.srcObject ? 'Ready' : 'No stream'}</p>
        <p>Pending Remote ID: {pendingRemoteUserId.current || 'None'}</p>
        <p>Is Offerer: {isOffererRef.current ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="control-buttons">
        <button onClick={retryMedia} className="retry-button">
          Retry Media
        </button>
        <button onClick={manualCreateOffer} className="offer-button">
          Manual Offer
        </button>
        <button onClick={manualSetRemoteDescription} className="debug-button">
          Check Connection
        </button>
      </div>
    </div>
  );
};

export default VideoCall;