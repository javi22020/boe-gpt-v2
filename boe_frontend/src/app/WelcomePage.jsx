import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const WelcomePage = ({ onStartChat }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden">
      <div className="space-y-8 text-center animate-fade-in-up">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-6xl font-bold">BOE-GPT</h1>
          <Image src="/logo.png" alt="BOE-GPT Logo" width={80} height={80} />
        </div>
        <p className="text-xl">El asistente inteligente para el Boletín Oficial del Estado</p>
        <Button 
          onClick={onStartChat}
          className="px-8 py-4 bg-blue-600 text-white rounded-full text-xl font-semibold hover:bg-blue-700 transition-colors duration-300"
        >
          Iniciar Chat
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;