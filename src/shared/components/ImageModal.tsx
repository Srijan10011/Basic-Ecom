import React from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <img 
          src={imageUrl} 
          alt="Review image enlarged" 
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on image
        />
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white text-2xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImageModal;