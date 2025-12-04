import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Plus, Search, Trophy, History, CheckCircle, CreditCard, Banknote, QrCode, Utensils, BedDouble } from 'lucide-react';
import { Client, Stay } from '../types';

const ClientList: React.FC = () => {
  const { clients, addClient, searchClients, getClientStays, checkoutStay, rooms } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Checkout Modal State
  const [checkoutData, setCheckoutData] = useState<{ client: Client, stay: Stay, roomRate: number, totalExtras: number } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    document: '',
  });

  const filteredClients = searchTerm ? searchClients(searchTerm) : clients;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(formData);
    setShowModal(false);
    setFormData({ name: '', address: '', phone: '', document: '' });
  };

  const initiateCheckout = (client: Client) => {
    const stays = getClientStays(client.id);
    const activeStay = stays.find(s => s.status === 'active');
    
    if (activeStay) {
        const room = rooms.find(r => r.number === activeStay.roomNumber);
        const roomRate = room ? room.dailyRate * activeStay.totalDays : 0;
        const totalExtras = (activeStay.charges || []).reduce((acc, curr) => acc + curr.amount, 0);

        setCheckoutData({ 
            client, 
            stay: activeStay, 
            roomRate, 
            totalExtras 
        });
    }
  };

  const handlePayment = (method: string) => {
      if (!checkoutData) return;
      
      checkoutStay(checkoutData.stay.id);
      alert(`Pagamento realizado via ${method}.\nCheckout concluído com sucesso!`);
      setCheckoutData(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-hotel-600 hover:bg-hotel-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar por nome ou código..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-hotel-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm font-semibold">
            <tr>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">CPF</th>
              <th className="px-6 py-4">Telefone</th>
              <th className="px-6 py-4">Pontos Fidelidade</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map(client => {
              const hasActiveStay = getClientStays(client.id).some(s => s.status === 'active');
              
              return (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">#{client.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{client.name}</td>
                  <td className="px-6 py-4 text-gray-600">{client.document || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.phone}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                      <Trophy size={12} /> {client.points}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    {hasActiveStay && (
                      <button
                        onClick={() => initiateCheckout(client)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors"
                        title="Realizar Checkout"
                      >
                        <CheckCircle size={12} /> Checkout
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="text-hotel-600 hover:text-hotel-800 text-sm font-medium"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Cadastrar Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input required type="text" placeholder="000.000.000-00" className="w-full p-2 border rounded-lg" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-hotel-600 text-white rounded-lg hover:bg-hotel-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout / Payment Modal */}
      {checkoutData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                 <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Banknote className="text-green-600" size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800">Finalizar Estadia</h2>
                 <p className="text-gray-500">Resumo da Conta</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 space-y-2">
                 <div className="flex justify-between text-sm pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Cliente / Quarto:</span>
                    <span className="font-bold">{checkoutData.client.name} / #{checkoutData.stay.roomNumber}</span>
                 </div>
                 
                 <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-gray-500 flex items-center gap-1"><BedDouble size={14}/> Diárias ({checkoutData.stay.totalDays} dias):</span>
                    <span className="font-medium">R$ {checkoutData.roomRate.toFixed(2)}</span>
                 </div>
                 
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1"><Utensils size={14}/> Consumo (Restaurante):</span>
                    <span className="font-medium text-orange-600">R$ {checkoutData.totalExtras.toFixed(2)}</span>
                 </div>

                 <div className="border-t border-gray-200 pt-3 flex justify-between items-center mt-2">
                    <span className="font-medium text-gray-700">Total a Pagar:</span>
                    <span className="text-3xl font-bold text-green-700">R$ {(checkoutData.roomRate + checkoutData.totalExtras).toFixed(2)}</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <button onClick={() => handlePayment('Pix')} className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all font-medium">
                    <QrCode size={20} /> Pagamento via Pix
                 </button>
                 <button onClick={() => handlePayment('Cartão de Débito')} className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all font-medium">
                    <CreditCard size={20} /> Cartão de Débito
                 </button>
                 <button onClick={() => handlePayment('Cartão de Crédito')} className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 transition-all font-medium">
                    <CreditCard size={20} /> Cartão de Crédito
                 </button>
              </div>
              
              <button 
                onClick={() => setCheckoutData(null)}
                className="w-full mt-6 py-2 text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Cancelar
              </button>
           </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                <p className="text-gray-500">CPF: {selectedClient.document} • {selectedClient.phone}</p>
                <p className="text-gray-500 text-sm">{selectedClient.address}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <p className="text-yellow-700 text-sm font-bold uppercase mb-1">Programa de Fidelidade</p>
                <p className="text-3xl font-bold text-yellow-900">{selectedClient.points} <span className="text-sm font-normal">pontos</span></p>
                <div className="text-xs text-yellow-600 mt-2">
                    <p>Standard: 1 ponto/dia</p>
                    <p>Luxo: 2 pontos/dia</p>
                    <p>Presidente: 4 pontos/dia</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-blue-700 text-sm font-bold uppercase mb-1">Total de Estadias</p>
                <p className="text-3xl font-bold text-blue-900">{getClientStays(selectedClient.id).length}</p>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><History size={20}/> Histórico de Estadias</h3>
            <div className="space-y-3">
              {getClientStays(selectedClient.id).map(stay => (
                <div key={stay.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                   <div>
                      <p className="font-bold">Quarto #{stay.roomNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(stay.checkInDate).toLocaleDateString()} - {new Date(stay.checkOutDate).toLocaleDateString()}
                      </p>
                      {stay.charges && stay.charges.length > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                              + R$ {stay.charges.reduce((a,c) => a+c.amount, 0).toFixed(2)} em consumo
                          </p>
                      )}
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-green-700">R$ {stay.totalCost.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${stay.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {stay.status === 'active' ? 'Ativa' : 'Finalizada'}
                      </span>
                   </div>
                </div>
              ))}
              {getClientStays(selectedClient.id).length === 0 && (
                 <p className="text-gray-500 italic">Nenhuma estadia registrada.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;