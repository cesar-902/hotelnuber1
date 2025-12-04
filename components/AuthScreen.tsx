import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Mail, Key, CheckCircle } from 'lucide-react';

const AuthScreen: React.FC = () => {
    const { login, addEmployee } = useHotel();
    
    // Login State
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Google Completion State
    const [showGoogleComplete, setShowGoogleComplete] = useState(false);
    const [googleData, setGoogleData] = useState({
        email: '', 
        role: '',
        shift: 'Manhã',
        document: '',
        phone: '',
        localPassword: ''
    });

    const validatePassword = (pwd: string) => {
        // At least 8 chars, 1 number, 1 special char
        const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return regex.test(pwd);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(identifier, password);
        if (!success) {
            setError('Credenciais inválidas. Verifique seu email e senha.');
        }
    };

    const handleGoogleAuth = () => {
        // Simulate receiving data from Google
        // We leave email empty or set a placeholder, but now allow the user to edit it
        // to simulate logging in with a specific Google account.
        setGoogleData({
            email: '', 
            role: '',
            shift: 'Manhã',
            document: '',
            phone: '',
            localPassword: ''
        });
        setShowGoogleComplete(true);
    };

    const handleGoogleFinalize = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePassword(googleData.localPassword)) {
             alert('A senha definida é muito fraca. Deve ter no mínimo 8 caracteres, 1 número e 1 caractere especial (!@#$%^&*).');
             return;
        }

        const mockGoogleName = "Usuário Google (Demo)";

        try {
            addEmployee({
                name: mockGoogleName,
                email: googleData.email, 
                document: googleData.document,
                password: googleData.localPassword, // User defined password
                phone: googleData.phone,
                role: googleData.role,
                salary: 1500,
                shift: googleData.shift as 'Manhã' | 'Tarde' | 'Noite'
            });

            login(googleData.email, googleData.localPassword);
            setShowGoogleComplete(false);
        } catch (e: any) {
            alert(e.message || "Erro ao finalizar cadastro com Google.");
        }
    }

    return (
        <div className="min-h-screen bg-hotel-900 flex items-center justify-center p-4 relative">
            
            {/* Round Logo Top Left */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/3195/3195304.png" 
                    alt="Logo Hotel" 
                    className="w-16 h-16 rounded-full bg-white p-2 shadow-lg"
                />
                <div className="hidden md:block">
                    <h1 className="text-white font-bold tracking-wider text-xl">DESCANSO</h1>
                    <p className="text-hotel-300 text-xs tracking-[0.3em]">GARANTIDO</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mt-12 md:mt-0">
                <div className="text-center mb-8">
                    <img 
                        src="https://cdn-icons-png.flaticon.com/512/3195/3195304.png" 
                        alt="Logo" 
                        className="w-16 h-16 rounded-full bg-blue-50 p-2 mx-auto mb-4 md:hidden" 
                    />
                    <h1 className="text-2xl font-bold text-hotel-900">Hotel Descanso Garantido</h1>
                    <p className="text-gray-500">Acesso ao Sistema</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input type="email" required className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-500 focus:outline-none" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="seu@email.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input type="password" required className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-500 focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-hotel-600 text-white py-3 rounded-lg font-bold hover:bg-hotel-700 transition-colors">Entrar</button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Ou entre com</span></div>
                </div>

                <button type="button" onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.47 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </button>
                
                <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-center text-gray-400"><p>Admin Padrão: admin@hotel.com / admin</p></div>
            </div>

            {/* Google Completion Modal */}
            {showGoogleComplete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4 text-green-600"><CheckCircle size={24} /><h2 className="text-xl font-bold">Google Autenticado</h2></div>
                        <p className="text-gray-600 mb-6 text-sm">Olá, <strong>Usuário Google</strong>! Para concluir o cadastro, confirme seu email e defina uma senha de acesso.</p>
                        <form onSubmit={handleGoogleFinalize} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Google) <span className="text-red-500">*</span></label>
                                <input 
                                    required 
                                    type="email" 
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-hotel-500" 
                                    placeholder="seu@email.com"
                                    value={googleData.email} 
                                    onChange={e => setGoogleData({...googleData, email: e.target.value})}
                                />
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ <span className="text-red-500">*</span></label><input required type="text" className="w-full p-2 border rounded-lg" value={googleData.document} onChange={e => setGoogleData({...googleData, document: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone <span className="text-red-500">*</span></label><input required type="text" className="w-full p-2 border rounded-lg" value={googleData.phone} onChange={e => setGoogleData({...googleData, phone: e.target.value})} /></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Crie uma Senha Local <span className="text-red-500">*</span></label>
                                <input required type="password" className="w-full p-2 border rounded-lg" value={googleData.localPassword} onChange={e => setGoogleData({...googleData, localPassword: e.target.value})} />
                                <p className="text-[10px] text-gray-500 mt-1 leading-tight">Mínimo 8 caracteres, 1 número e 1 caractere especial (!@#$%^&*)</p>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cargo <span className="text-red-500">*</span></label><select required className="w-full p-2 border rounded-lg" value={googleData.role} onChange={e => setGoogleData({...googleData, role: e.target.value})}><option value="">Selecione...</option><option value="Gerente">Gerente</option><option value="Recepcionista">Recepcionista</option><option value="Auxiliar de Limpeza">Auxiliar de Limpeza</option><option value="Garçom">Garçom</option><option value="Manutenção">Manutenção</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Turno <span className="text-red-500">*</span></label><select required className="w-full p-2 border rounded-lg" value={googleData.shift} onChange={e => setGoogleData({...googleData, shift: e.target.value})}><option value="Manhã">Manhã (07:00 - 16:00)</option><option value="Tarde">Tarde (14:00 - 23:00)</option><option value="Noite">Noite (23:00 - 07:00)</option></select></div>
                            <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowGoogleComplete(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button><button type="submit" className="flex-1 py-2 bg-hotel-600 text-white rounded-lg hover:bg-hotel-700 font-bold">Concluir</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AuthScreen;