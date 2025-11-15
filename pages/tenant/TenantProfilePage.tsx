import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { Upload, Save } from 'lucide-react';

const TenantProfilePage: React.FC = () => {
    const { user, updateUserProfile } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
    const [loading, setLoading] = useState(false);
    
    if (!user) return null;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let avatarUrl = user.avatar_url;

        if (avatarFile) {
            const filePath = `${user.id}/${Date.now()}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
            if (uploadError) {
                toast.error('Erro ao fazer upload do avatar.');
                setLoading(false);
                return;
            }
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = data.publicUrl;
        }

        const updates = {
            full_name: fullName,
            phone: phone,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        };
        
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

        if (error) {
            toast.error('Falha ao atualizar perfil.');
        } else {
            updateUserProfile(updates);
            toast.success('Perfil atualizado com sucesso!');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Meu Perfil</h1>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center space-x-6">
                    <img 
                        src={avatarPreview || `https://ui-avatars.com/api/?name=${user.full_name}&background=dcfce7&color=166534`} 
                        alt="Avatar" 
                        className="h-24 w-24 rounded-full object-cover" 
                    />
                    <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                        <Upload className="h-4 w-4 mr-2" />
                        Trocar Foto
                    </label>
                    <input id="avatar-upload" type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" id="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                </div>
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                    <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-hope-green-500 focus:border-hope-green-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Telefone</label>
                    <input type="text" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-hope-green-500 focus:border-hope-green-500 sm:text-sm" />
                </div>
                <div className="text-right">
                    <button type="submit" disabled={loading} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-hope-green-600 hover:bg-hope-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hope-green-500 disabled:bg-hope-green-300">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantProfilePage;