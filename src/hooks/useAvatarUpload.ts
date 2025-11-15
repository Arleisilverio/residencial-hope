import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useAvatarUpload = () => {
  const { user, fetchProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast.error('Usuário não autenticado.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Enviando foto...');

    const fileExt = file.name.split('.').pop();
    // Usamos o ID do usuário e um timestamp para garantir um nome de arquivo único
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const bucketName = 'avatars'; // Nome do bucket de armazenamento

    try {
      // 1. Upload do arquivo para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;

      // 3. Atualizar a tabela de perfis com a nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // 4. Recarregar o estado do perfil localmente
      await fetchProfile(user.id);

      toast.success('Foto de perfil atualizada com sucesso!', { id: toastId });
      return publicUrl;

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao enviar a foto.';
      toast.error(`Falha no upload: ${errorMessage}`, { id: toastId });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
};