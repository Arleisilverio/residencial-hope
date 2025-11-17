import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminDocumentManager } from '../../hooks/useAdminDocumentManager';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, File, UploadCloud, Trash2, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminTenantDocumentsPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { documents, isLoading, isUploading, uploadDocument, deleteDocument, createSignedUrlForDownload } = useAdminDocumentManager(tenantId);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocument(file);
    }
    // Limpa o valor para permitir o reenvio do mesmo arquivo
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDownload = async (fileName: string) => {
    setIsDownloading(fileName);
    const url = await createSignedUrlForDownload(fileName);
    if (url) {
      // Abrir a URL em uma nova aba; o navegador cuidará do download/visualização.
      window.open(url, '_blank');
    }
    // O toast de erro já é mostrado pelo hook se a URL não for gerada.
    setIsDownloading(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/documents" className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a lista
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-2 border-b dark:border-slate-700 pb-3">
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Gerenciar Documentos
            </h1>
            <Button asChild disabled={isUploading} className="cursor-pointer">
              <label htmlFor="admin-doc-upload">
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
              </label>
            </Button>
            <input
              id="admin-doc-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
              accept="application/pdf,image/jpeg,image/png"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Os arquivos enviados ficarão visíveis para o inquilino.
          </p>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-500 dark:text-slate-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">Nenhum documento encontrado para este inquilino.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
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
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => handleDownload(doc.name)}
                      disabled={isDownloading === doc.name}
                      className="p-2 text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 rounded-full transition-colors disabled:cursor-not-allowed"
                      title="Baixar documento"
                    >
                      {isDownloading === doc.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.name)}
                      className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-full transition-colors"
                      title="Excluir documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTenantDocumentsPage;