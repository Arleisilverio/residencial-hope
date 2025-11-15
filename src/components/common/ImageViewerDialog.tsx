import React from 'react';
import { Dialog } from '../ui/Dialog';
import { X } from 'lucide-react';

interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({ isOpen, onClose, imageUrl, altText }) => {
  if (!isOpen || !imageUrl) return null;

  // O componente Dialog já lida com o fechamento ao clicar fora.
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="" // Título vazio para focar na imagem
      // Removendo className e showCloseButton para resolver o erro de tipagem,
      // e aplicando o estilo de largura máxima no conteúdo.
    >
      <div className="relative max-w-3xl w-full mx-auto">
        <img 
          src={imageUrl} 
          alt={altText} 
          className="w-full h-auto object-contain rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20"
          title="Fechar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </Dialog>
  );
};

export default ImageViewerDialog;