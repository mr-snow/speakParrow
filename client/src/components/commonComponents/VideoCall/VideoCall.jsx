// src/components/VideoCall.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../../contexts/socketContext';

const VideoCall = ({ roomId, localStream, setLocalStream }) => {
  const socket = useSocket();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    initializeMedia();
  }, []);

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
      initializePeerConnection();
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here for production
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = event => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = event => {
      if (event.candidate && socket) {
        socket.emit('signal', {
          roomId,
          signal: {
            type: 'ice-candidate',
            candidate: event.candidate,
          },
        });
      }
    };

    setPeerConnection(pc);
  };

  // Add socket listeners for signaling
  useEffect(() => {
    if (!socket || !peerConnection) return;

    socket.on('signal', async data => {
      try {
        if (data.signal.type === 'offer') {
          await peerConnection.setRemoteDescription(data.signal);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit('signal', {
            roomId,
            signal: answer,
          });
        } else if (data.signal.type === 'answer') {
          await peerConnection.setRemoteDescription(data.signal);
        } else if (data.signal.type === 'ice-candidate') {
          await peerConnection.addIceCandidate(data.signal.candidate);
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });

    return () => {
      socket.off('signal');
    };
  }, [socket, peerConnection, roomId]);

  const startCall = async () => {
    if (!peerConnection) return;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (socket) {
        socket.emit('signal', {
          roomId,
          signal: offer,
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  return (
    <div className="video-call-container">
      <div className="video-grid">
        <video ref={localVideoRef} autoPlay muted className="local-video" />
        {remoteStream && (
          <video ref={remoteVideoRef} autoPlay className="remote-video" />
        )}
      </div>
      <button onClick={startCall} className="start-call-btn">
        Start Call
      </button>
    </div>
  );
};

export default VideoCall;
