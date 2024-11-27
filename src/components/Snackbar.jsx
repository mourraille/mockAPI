import React from 'react';

const Snackbar = ({ message, isOpen, onClose }) => {
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-green-500 text-white text-sm font-medium px-4 py-2 rounded shadow-lg">
        {message}
        <button
          onClick={onClose}
          className="ml-4 text-gray-300 hover:text-white"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Snackbar; 