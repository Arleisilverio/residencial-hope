import React, { useRef } from 'react';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { Button } from '../ui/Button';
import { File, UploadCloud, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DocumentUploader: React.FC = () => {
  const { documents, isLoading, isUploading, uploadDocument, deleteDocument } = useDocumentUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocument(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-2 border-b dark:border-slate-700 pb-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <FolderOpen className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
          Meus Documentos
        </h2>
        <Button onClick={handleUploadClick} disabled={isUploading}>
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4 mr-2" />
          )}
          {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
          accept="application/pdf,image/jpeg,image/png"
        />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Formatos aceitos: PDF, JPG, PNG. Tamanho máximo: 5MB.
      </p>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-500 dark:text-slate-400" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Carregando documentos...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">Nenhum documento encontrado.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Clique em "Enviar Arquivo" para começar.</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center min-w-0">
                <File className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(doc.metadata.size)} - {format(new Date(doc.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteDocument(doc.name)}
                className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-full transition-colors ml-2"
                title="Excluir documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentUploader;