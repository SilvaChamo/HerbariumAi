import React, { useState } from 'react';
import { User, AppTab } from '../../types';
import { supabase } from '../../supabaseClient';

interface AuthFormProps {
    onAuth: (user: User) => void;
    onNavigate: (tab: AppTab) => void;
    onAlert?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth, onNavigate, onAlert }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
                if (error) {
                    if (error.message.includes('User already registered') || error.status === 422) {
                        onAlert?.('Aviso', 'Este email já está registado. Por favor, faça login.', 'info');
                        setIsRegistering(false);
                        return;
                    }
                    throw error;
                }

                if (data.user) {
                    if (data.session) {
                        onAuth({
                            id: data.user.id,
                            email: data.user.email || '',
                            name: data.user.user_metadata.full_name || 'Usuário'
                        });
                    } else {
                        onAlert?.('Sucesso', 'Registo realizado! Por favor, verifique o seu email para confirmar a conta.', 'success');
                        setIsRegistering(false);
                    }
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
                        name: data.user.user_metadata.full_name || 'Usuário'
                    });
                }
            }
        } catch (error: any) {
            onAlert?.('Erro', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            onAlert?.('Atenção', "Por favor, insira o seu email primeiro.", 'info');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });
            if (error) throw error;
            onAlert?.('Sucesso', "Email de redefinição enviado! Verifique a sua caixa de entrada.", 'success');
        } catch (error: any) {
            onAlert?.('Erro', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 h-full flex flex-col justify-center animate-in slide-in-from-bottom">
            <button
                onClick={() => onNavigate(AppTab.SCAN)}
                className="mb-10 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-orange-500 transition-colors group w-full"
            >
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-[12px] flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-all">
                    <i className="fa-solid fa-arrow-left"></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Voltar ao Scanner</span>
            </button>

            <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-[12px] border border-slate-900/[0.05] dark:border-slate-800 backdrop-blur-[2px]">
                <h2 className="text-2xl font-black text-[#1e293b] dark:text-slate-100 mb-2 text-center">
                    {isRegistering ? 'Criar Nova Conta' : 'Acesse sua Conta'}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-300 mb-8 font-medium text-center">
                    {isRegistering ? 'Registe-se para aceder ao mercado completo.' : 'Bem-vindo de volta ao Botânica.'}
                </p>

                <form onSubmit={handleAuth} className="space-y-3">
                    {isRegistering && (
                        <div className="relative">
                            <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm"></i>
                            <input
                                required
                                type="text"
                                placeholder="Nome completo"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[12px] px-4 py-3 text-xs font-semibold focus:border-emerald-500 dark:text-slate-100 transition-all outline-none"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm"></i>
                        <input
                            required
                            type="email"
                            placeholder="Seu email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3 pl-11 rounded-[12px] outline-none text-xs focus:border-emerald-400 dark:text-slate-100 transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm"></i>
                        <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Sua senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 pl-11 pr-11 rounded-[12px] outline-none text-xs focus:border-emerald-400 dark:text-slate-100 transition-all shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-400 transition-colors"
                        >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>

                    {!isRegistering && (
                        <div className="flex justify-center mt-2">
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-orange-500 transition-colors"
                            >
                                esqueceu a senha? <span className="text-emerald-500 dark:text-emerald-400 underline underline-offset-4">redefinir senha</span>
                            </button>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#059669] hover:bg-[#047857] text-white py-4 rounded-[12px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'A PROCESSAR...' : (isRegistering ? 'FINALIZAR REGISTO' : 'ENTRAR AGORA')}
                    </button>
                </form>
                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="w-full text-center mt-8 text-slate-400 dark:text-slate-300 text-[11px] font-black uppercase tracking-tight group transition-all"
                >
                    {isRegistering ? (
                        <>Já tem uma conta? <span className="text-emerald-500 dark:text-emerald-400 group-hover:text-orange-500 transition-colors">Entrar</span></>
                    ) : (
                        <>Novo por aqui? <span className="text-emerald-500 dark:text-emerald-400 group-hover:text-orange-500 transition-colors">Criar conta gratuita</span></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AuthForm;
