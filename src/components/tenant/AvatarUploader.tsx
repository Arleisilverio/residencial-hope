import React, { useRef } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { Profile } from '../../types';

interface AvatarUploaderProps {
  profile: Profile;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ profile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading } = useAvatarUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
    // Reset input value to allow re-uploading the same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const avatarUrl = profile.avatar_url;

  return (
    <div className="relative w-32 h-32 mx-auto mb-4">
      {/* Avatar Display */}
      <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={profile.full_name || 'Avatar'} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <User className="w-16 h-16 text-slate-500 dark:text-slate-400" />
        )}
      </div>

      {/* Upload Button Overlay */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        title="Mudar foto de perfil"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Camera className="w-5 h-5" />
        )}
      </button>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default AvatarUploader;