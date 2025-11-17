import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { FileObject } from '@supabase/storage-js';
import { sanitizeFileName } from '../lib/utils';

const BUCKET_NAME = 'documents';
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useAdminDocumentManager = (tenantId: string | undefined) => {
  const [documents, setDocuments] = useState<FileObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const listDocuments = useCallback(async () => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(tenantId, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      if (data) setDocuments(data);
    } catch (error) {
      console.error('Error listing documents:', error);
      toast.error('Não foi possível carregar os documentos do inquilino.');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    listDocuments();
  }, [listDocuments]);

  const uploadDocument = async (file: File) => {
    if (!tenantId) {
      toast.error('ID do inquilino não encontrado.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('O arquivo é muito grande. O limite é de 5MB.');
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use PDF, JPG ou PNG.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Enviando ${file.name}...`);
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${tenantId}/${sanitizedFileName}`;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      toast.success('Documento enviado com sucesso!', { id: toastId });
      await listDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Falha no envio: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (fileName: string) => {
    if (!tenantId) {
      toast.error('ID do inquilino não encontrado.');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
        return;
    }

    const toastId = toast.loading(`Excluindo ${fileName}...`);
    const filePath = `${tenantId}/${fileName}`;

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

  const createSignedUrlForDownload = async (fileName: string): Promise<string | null> => {
    if (!tenantId) {
      toast.error('ID do inquilino não encontrado.');
      return null;
    }
    const filePath = `${tenantId}/${fileName}`;
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60); // URL é válida por 60 segundos

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast.error('Não foi possível gerar o link para download.');
      return null;
    }
  };

  return { documents, isLoading, isUploading, uploadDocument, deleteDocument, createSignedUrlForDownload };
};