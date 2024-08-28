import React from 'react';
import { cn } from "@/lib/utils";

const Sidebar = ({ children, position = 'left', open, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 bottom-0 w-64 bg-white dark:bg-gray-800 p-4 transition-transform duration-300 ease-in-out z-50",
          position === 'left' ? 'left-0' : 'right-0',
          open ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          &times;
        </button>
        {children}
      </div>
    </>
  );
};

export { Sidebar };