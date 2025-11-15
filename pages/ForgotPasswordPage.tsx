import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await sendPasswordResetEmail(email);
    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        {submitted ? (
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-hope-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Verifique seu e-mail</h2>
            <p className="mt-2 text-sm text-gray-600">
              Se uma conta com este e-mail existir, enviamos um link para você redefinir sua senha.
            </p>
            <div className="mt-6">
              <Link to="/login" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-hope-green-600 hover:bg-hope-green-700">
                Voltar para o Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Esqueceu sua senha?</h2>
              <p className="mt-2 text-sm text-gray-600">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleResetRequest}>
              <input
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-hope-green-500 focus:border-hope-green-500 sm:text-sm"
                placeholder="Endereço de e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-hope-green-600 hover:bg-hope-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hope-green-500 disabled:bg-hope-green-300"
                >
                  {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                </button>
              </div>
            </form>
             <div className="text-sm text-center text-slate-500">
              Lembrou a senha?{' '}
              <Link to="/login" className="font-medium text-hope-green-600 hover:text-hope-green-500">
                Faça login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;