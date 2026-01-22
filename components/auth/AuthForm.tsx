import React, { useState } from 'react';
import { User, AppTab } from '../../types';
import { supabase } from '../../supabaseClient';

interface AuthFormProps {
    onAuth: (user: User) => void;
    onNavigate: (tab: AppTab) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth, onNavigate }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isRegistering) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                if (data.user) {
                    onAuth({
                        id: data.user.id,
                        email: data.user.email || '',
                        name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || ''
                    });
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    onAuth({
                        id: data.user.id,
                        email: data.user.email || '',
                        name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || ''
                    });
                }
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 h-full flex flex-col justify-center animate-in slide-in-from-bottom">
            <button
                onClick={() => onNavigate(AppTab.SCAN)}
                className="mb-8 text-slate-400 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h2 className="text-3xl font-bold text-[#1e293b] mb-6">
                {isRegistering ? 'Criar Nova Conta' : 'Acesse seu Repositório'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering && (
                    <input
                        required
                        type="text"
                        placeholder="Nome completo"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none"
                    />
                )}
                <input
                    required
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none"
                />
                <input
                    required
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#10b981] hover:bg-orange-500 text-white py-4 rounded-full font-bold shadow-lg transition-all disabled:opacity-50"
                >
                    {loading ? 'Processando...' : (isRegistering ? 'Finalizar Registro' : 'Entrar Agora')}
                </button>
            </form>
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-center mt-6 text-[#10b981] text-sm font-bold"
            >
                {isRegistering ? 'Já tem conta? Entrar' : 'Novo por aqui? Criar conta gratuita'}
            </button>
        </div>
    );
};

export default AuthForm;
