import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  );
};

export default LoadingSpinner;