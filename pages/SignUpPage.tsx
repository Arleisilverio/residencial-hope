import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !apartmentNumber) {
        toast.error('Por favor, preencha todos os campos.');
        return;
    }
    setLoading(true);
    const { error } = await signUp(fullName, email, password, parseInt(apartmentNumber, 10));
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Cadastro realizado com sucesso!');
      // The router will redirect automatically
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crie sua Conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Preencha os dados para seu primeiro acesso.
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSignUp}>
          <input
            type="text"
            required
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-hope-green-500 focus:border-hope-green-500 sm:text-sm"
            placeholder="Nome Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            autoComplete="email"
            required
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-hope-green-500 focus:border-hope-green-500 sm:text-sm"
            placeholder="Endereço de e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-hope-green-500 focus:border-hope-green-500 sm:text-sm"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="number"
            required
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-hope-green-500 focus:border-hope-green-500 sm:text-sm"
            placeholder="Número do Apartamento"
            value={apartmentNumber}
            onChange={(e) => setApartmentNumber(e.target.value)}
          />
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group mt-4 relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-hope-green-600 hover:bg-hope-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hope-green-500 disabled:bg-hope-green-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-hope-green-500 group-hover:text-hope-green-400" />
              </span>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-slate-500">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-hope-green-600 hover:text-hope-green-500">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;