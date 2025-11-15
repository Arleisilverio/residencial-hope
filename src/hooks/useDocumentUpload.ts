import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FileObject } from '@supabase/storage-js';

const BUCKET_NAME = 'documents';

export const useDocumentUpload = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<FileObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const listDocuments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      if (data) setDocuments(data);
    } catch (error) {
      console.error('Error listing documents:', error);
      toast.error('Não foi possível carregar os documentos.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    listDocuments();
  }, [listDocuments]);

  const uploadDocument = async (file: File) => {
    if (!user) {
      toast.error('Usuário não autenticado.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('O arquivo é muito grande. O limite é de 5MB.');
        return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Enviando ${file.name}...`);
    const filePath = `${user.id}/${file.name}`;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file with same name exists
        });

      if (error) throw error;

      toast.success('Documento enviado com sucesso!', { id: toastId });
      await listDocuments(); // Refresh the list
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Falha no envio: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (fileName: string) => {
    if (!user) {
      toast.error('Usuário não autenticado.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
        return;
    }

    const toastId = toast.loading(`Excluindo ${fileName}...`);
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;

      toast.success('Documento excluído com sucesso!', { id: toastId });
      setDocuments(prev => prev.filter(doc => doc.name !== fileName));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Falha ao excluir: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`, { id: toastId });
    }
  };

  return { documents, isLoading, isUploading, uploadDocument, deleteDocument };
};