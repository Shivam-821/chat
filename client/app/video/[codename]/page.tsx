"use client"

import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { use } from 'react'

interface PageProps {
  params: Promise<{ codename: string }>;
}

const VideoCallPage = ({ params }: PageProps) => {
    const codename = use(params).codename;
    const { token } = useAuth();
    const socket = useSocket();
  return <div>{codename}</div>;
};

export default VideoCallPage