import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

export const LiveClassRoom = () => {
  const { roomName } = useParams();
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isStudent) {
      // Record attendance when entering room
      api.post(`/webinars/room/${roomName}/attend`).catch(console.error);
    }
  }, [user, roomName, isStudent]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Please log in to join the live class.</p>
      </div>
    );
  }

  // Jitsi configuration embedded in URL hash
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(user.name)}"&config.prejoinPageEnabled=false`;

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-slate-200">Live Class: {roomName.replace('EduBuddy_', '')}</span>
        </div>
        <div className="text-xs text-brand-400 font-bold bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20">
          Live Session
        </div>
      </div>
      
      <div className="flex-1 w-full bg-black">
        <iframe
          allow="camera; microphone; display-capture; fullscreen; autoplay"
          src={jitsiUrl}
          style={{ width: '100%', height: '100%', border: 0 }}
          title="Live Class Room"
        />
      </div>
    </div>
  );
};
