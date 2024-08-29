import React, { useContext } from 'react';
import { useTheme } from '@/context/theme';

const LoadingSpinner = ({ size = 'medium' }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const color = darkMode ? 'border-white' : 'border-black';

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-t-4 border-b-2 ${sizeClasses[size]} ${color}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;