import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Users, BedDouble, CalendarCheck, Banknote, Sparkles, Wrench, CheckCircle, History, Bot, FileText, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-full ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { clients, rooms, stays, serviceRequests, employees, completeServiceRequest } = useHotel();
  const [servicesViewMode, setServicesViewMode] = useState<'pending' | 'history'>('pending');
  
  // AI Report State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [aiReport, setAiReport] = useState('');

  const activeStays = stays.filter(s => s.status === 'active').length;
  const occupiedRooms = rooms.filter(r => r.status === 'ocupado').length;
  const totalRevenue = stays.reduce((acc, curr) => acc + curr.totalCost, 0);
  
  const pendingServices = serviceRequests.filter(s => s.status === 'pending');
  const completedServices = serviceRequests.filter(s => s.status === 'completed').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setAiReport('');
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Prepare data context for the AI
        const contextData = `
            DADOS DO HOTEL DESCANSO GARANTIDO:
            - Total de Clientes Cadastrados: ${clients.length}
            - Quartos Ocupados Agora: ${occupiedRooms} de ${rooms.length}
            - Estadias Ativas: ${activeStays}
            - Receita Total Acumulada: R$ ${totalRevenue.toFixed(2)}
            - Solicitações de Serviço Pendentes: ${pendingServices.length}
            - Solicitações de Serviço Concluídas: ${completedServices.length}
            - Total de Funcionários: ${employees.length}
            
            DETALHES DE OCUPAÇÃO:
            ${rooms.map(r => `Quarto ${r.number} (${r.category}): ${r.status}`).join(', ')}
        `;

        const prompt = `
            Você é um consultor especialista em gestão hoteleira. Analise os dados brutos abaixo do "Hotel Descanso Garantido" e gere um Relatório Executivo sucinto e profissional.
            
            O relatório deve conter:
            1. Resumo da Saúde Financeira.
            2. Análise de Eficiência Operacional (baseado em ocupação e serviços).
            3. Recomendações de curto prazo para a gerência.

            Use formatação clara. Não invente dados que não estão listados, apenas analise os fornecidos.
            
            DADOS:
            ${contextData}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setAiReport(response.text || "Não foi possível gerar o relatório.");
        setShowReportModal(true);
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com a IA do Gemini. Verifique a chave de API.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
          
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold shadow-sm transition-all ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}`}
          >
            {isGenerating ? (
                <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Gerando Análise...
                </>
            ) : (
                <>
                    <Bot size={20} />
                    Relatório IA (Gemini)
                </>
            )}
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Clientes" value={clients.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Estadias Ativas" value={activeStays} icon={CalendarCheck} color="bg-green-500" />
        <StatCard title="Quartos Ocupados" value={occupiedRooms} icon={BedDouble} color="bg-orange-500" />
        <StatCard title="Faturamento Total" value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`} icon={Banknote} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Stays */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quartos Recentemente Ocupados</h2>
            {stays.filter(s => s.status === 'active').length === 0 ? (
            <p className="text-gray-500 italic">Nenhuma estadia ativa no momento.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="px-4 py-3">Quarto</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Entrada</th>
                    <th className="px-4 py-3">Saída Prevista</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stays.filter(s => s.status === 'active').slice(0, 5).map(stay => {
                    const client = clients.find(c => c.id === stay.clientId);
                    return (
                        <tr key={stay.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">#{stay.roomNumber}</td>
                        <td className="px-4 py-3">{client?.name || 'Desconhecido'}</td>
                        <td className="px-4 py-3">{new Date(stay.checkInDate).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3">{new Date(stay.checkOutDate).toLocaleDateString('pt-BR')}</td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>
            )}
        </div>

        {/* Service Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Solicitações de Serviço
                        {servicesViewMode === 'pending' && pendingServices.length > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">{pendingServices.length}</span>
                        )}
                    </h2>
                    <div className="flex bg-gray-100 rounded-lg p-1 text-xs font-medium">
                        <button 
                            onClick={() => setServicesViewMode('pending')}
                            className={`px-3 py-1 rounded-md transition-all ${servicesViewMode === 'pending' ? 'bg-white shadow text-hotel-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pendentes
                        </button>
                        <button 
                            onClick={() => setServicesViewMode('history')}
                            className={`px-3 py-1 rounded-md transition-all ${servicesViewMode === 'history' ? 'bg-white shadow text-hotel-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Histórico
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] min-h-[150px]">
                {servicesViewMode === 'pending' ? (
                    pendingServices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <CheckCircle size={48} className="mb-2 text-green-200" />
                            <p>Tudo limpo e funcionando!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingServices.map(req => {
                                const employee = employees.find(e => e.id === req.employeeId);
                                return (
                                    <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${req.type === 'cleaning' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {req.type === 'cleaning' ? <Sparkles size={18} /> : <Wrench size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Quarto #{req.roomNumber}</p>
                                                <p className="text-xs text-gray-500">
                                                    {req.type === 'cleaning' ? 'Limpeza' : 'Manutenção'} - Resp: {employee?.name || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => completeServiceRequest(req.id)}
                                            className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                                        >
                                            Concluir
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    // History View
                    completedServices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <History size={48} className="mb-2 text-gray-200" />
                            <p>Nenhum histórico de serviços.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {completedServices.map(req => {
                                const employee = employees.find(e => e.id === req.employeeId);
                                return (
                                    <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg bg-white opacity-75">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-gray-100 text-gray-500">
                                                {req.type === 'cleaning' ? <Sparkles size={18} /> : <Wrench size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-700">Quarto #{req.roomNumber}</p>
                                                <p className="text-xs text-gray-500">
                                                    {req.type === 'cleaning' ? 'Limpeza' : 'Manutenção'} • {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-[10px] text-gray-400">Feito por: {employee?.name || 'Sistema'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12}/> OK
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
      </div>

      {/* AI Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Relatório de Gestão IA</h2>
                            <p className="text-xs text-gray-500">Gerado por Gemini 2.5 Flash</p>
                        </div>
                    </div>
                    <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {aiReport}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={() => setShowReportModal(false)}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;