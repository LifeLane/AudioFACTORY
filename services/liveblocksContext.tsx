import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface StudioCollaborator {
  id: string;
  name: string;
  role: 'Director' | 'Sound Engineer' | 'Voice Talent' | 'Producer';
  color: string;
  avatar: string;
  activeLineIndex?: number | null;
  status: 'online' | 'editing' | 'listening';
}

interface LiveblocksContextType {
  roomId: string;
  collaborators: StudioCollaborator[];
  currentUser: StudioCollaborator;
  activeEditingLine: number | null;
  setActiveEditingLine: (lineIndex: number | null) => void;
  broadcastAudioPlay: (speaker: string, lineIndex: number) => void;
  activePlayingSpeaker: string | null;
}

const DEFAULT_COLLABORATORS: StudioCollaborator[] = [
  {
    id: 'collab-1',
    name: 'Elena Vance',
    role: 'Sound Engineer',
    color: '#0284c7', // Sky 600
    avatar: 'EV',
    status: 'online'
  },
  {
    id: 'collab-2',
    name: 'Marcus Brody',
    role: 'Voice Talent',
    color: '#e11d48', // Rose 600
    avatar: 'MB',
    status: 'online'
  }
];

const LiveblocksContext = createContext<LiveblocksContextType | null>(null);

export const LiveblocksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roomId] = useState('audio-factory-master-room');
  const [currentUser] = useState<StudioCollaborator>({
    id: 'user-me',
    name: 'You (Creator)',
    role: 'Director',
    color: '#d97706', // Amber 600
    avatar: 'ME',
    status: 'online'
  });

  const [collaborators, setCollaborators] = useState<StudioCollaborator[]>(DEFAULT_COLLABORATORS);
  const [activeEditingLine, setActiveEditingLine] = useState<number | null>(null);
  const [activePlayingSpeaker, setActivePlayingSpeaker] = useState<string | null>(null);

  // Subtle interactive presence activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => 
        prev.map(c => {
          if (c.id === 'collab-1') {
            const statuses: ('online' | 'editing' | 'listening')[] = ['online', 'listening', 'editing'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...c, status: randomStatus, activeLineIndex: randomStatus === 'editing' ? 1 : null };
          }
          return c;
        })
      );
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const broadcastAudioPlay = (speaker: string, lineIndex: number) => {
    setActivePlayingSpeaker(speaker);
    setTimeout(() => {
      setActivePlayingSpeaker(null);
    }, 4000);
  };

  return (
    <LiveblocksContext.Provider
      value={{
        roomId,
        collaborators,
        currentUser,
        activeEditingLine,
        setActiveEditingLine,
        broadcastAudioPlay,
        activePlayingSpeaker
      }}
    >
      {children}
    </LiveblocksContext.Provider>
  );
};

export const useLiveblocks = () => {
  const context = useContext(LiveblocksContext);
  if (!context) {
    throw new Error('useLiveblocks must be used within a LiveblocksProvider');
  }
  return context;
};
