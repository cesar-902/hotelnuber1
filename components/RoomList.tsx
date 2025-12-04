import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Plus, Bed, Sparkles, Wrench, Check, AlertCircle } from 'lucide-react';
import { RoomCategory } from '../types';

const RoomList: React.FC = () => {
  const { rooms, addRoom, employees, addServiceRequest, serviceRequests, completeServiceRequest } = useHotel();
  
  // State for Add Room Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    capacity: 2,
    category: 'Standard' as RoomCategory,
  });

  // State for Service Assignment Modal
  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    type: 'cleaning' | 'maintenance' | null;
    roomNumber: string | null;
  }>({ isOpen: false, type: null, roomNumber: null });
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const getPrice = (cat: RoomCategory) => {
    switch(cat) {
        case 'Presidente': return 600;
        case 'Luxo': return 300;
        default: return 150;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoom({
        ...formData,
        dailyRate: getPrice(formData.category),
        status: 'disponivel'
    });
    setShowAddModal(false);
    setFormData({ number: '', capacity: 2, category: 'Standard' });
  };

  const openServiceModal = (type: 'cleaning' | 'maintenance', roomNumber: string) => {
    setServiceModal({ isOpen: true, type, roomNumber });
    setSelectedEmployeeId('');
  };

  const handleConfirmService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !serviceModal.type || !serviceModal.roomNumber) return;

    addServiceRequest({
        roomNumber: serviceModal.roomNumber,
        type: serviceModal.type,
        employeeId: selectedEmployeeId
    });

    const actionName = serviceModal.type === 'cleaning' ? 'Limpeza' : 'Manutenção';
    alert(`Mensagem do Sistema:\n\nSolicitação enviada com sucesso!\nO Quarto ${serviceModal.roomNumber} foi marcado para ${actionName}.`);
    
    setServiceModal({ isOpen: false, type: null, roomNumber: null });
    setSelectedEmployeeId('');
  };

  const categoryColor = (cat: RoomCategory) => {
    switch(cat) {
      case 'Presidente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Luxo': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }

  const cleaningStaffCount = employees.filter(e => e.role === 'Auxiliar de Limpeza').length;
  const maintenanceStaffCount = employees.filter(e => e.role === 'Manutenção').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quartos</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-hotel-600 hover:bg-hotel-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Novo Quarto
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {rooms.sort((a,b) => a.number.localeCompare(b.number)).map(room => {
            // Check for pending services
            const pendingCleaning = serviceRequests.find(s => s.roomNumber === room.number && s.type === 'cleaning' && s.status === 'pending');
            const pendingMaintenance = serviceRequests.find(s => s.roomNumber === room.number && s.type === 'maintenance' && s.status === 'pending');

            return (
              <div key={room.number} className={`relative p-4 rounded-xl border-2 flex flex-col justify-between aspect-[4/5] transition-all ${
                room.status === 'ocupado' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-white hover:shadow-md'
              }`}>
                 <div className="flex flex-col items-center flex-1 justify-center relative">
                    <div className={`absolute top-0 right-0 w-3 h-3 rounded-full ${room.status === 'ocupado' ? 'bg-red-500' : 'bg-green-500'}`} title={room.status} />
                    
                    {/* Visual Markers for Pending Services */}
                    <div className="absolute top-0 left-0 flex flex-col gap-1">
                        {pendingCleaning && <div className="bg-yellow-400 text-white p-1 rounded-full shadow-sm animate-pulse" title="Limpeza Pendente"><Sparkles size={12}/></div>}
                        {pendingMaintenance && <div className="bg-orange-500 text-white p-1 rounded-full shadow-sm animate-pulse" title="Manutenção Pendente"><Wrench size={12}/></div>}
                    </div>

                    <Bed size={32} className={`mb-2 ${room.status === 'ocupado' ? 'text-red-400' : 'text-gray-400'}`} />
                    <h3 className="text-2xl font-bold text-gray-800">#{room.number}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold mb-1 ${categoryColor(room.category)}`}>{room.category}</span>
                    <div className="text-center text-xs text-gray-500">
                        <p>Cap: {room.capacity} pessoas</p>
                        <p>R$ {room.dailyRate}/dia</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-2 mt-4">
                    {/* Cleaning Button */}
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (pendingCleaning) {
                                if(window.confirm(`Confirmar conclusão da limpeza do quarto ${room.number}?`)) {
                                    completeServiceRequest(pendingCleaning.id);
                                }
                            } else {
                                if (cleaningStaffCount === 0) {
                                    alert('Não há funcionários "Auxiliar de Limpeza" cadastrados para realizar esta tarefa.');
                                } else {
                                    openServiceModal('cleaning', room.number); 
                                }
                            }
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded border border-black transition-colors ${
                            pendingCleaning 
                            ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 font-bold' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                        title={pendingCleaning ? "Clique para concluir a limpeza" : "Solicitar Limpeza"}
                    >
                        {pendingCleaning ? <Check size={16} /> : <Sparkles size={16} />}
                        <span className="text-[10px] font-bold mt-1">{pendingCleaning ? 'Concluir' : 'Limpeza'}</span>
                    </button>

                    {/* Maintenance Button */}
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (pendingMaintenance) {
                                if(window.confirm(`Confirmar conclusão da manutenção do quarto ${room.number}?`)) {
                                    completeServiceRequest(pendingMaintenance.id);
                                }
                            } else {
                                if (maintenanceStaffCount === 0) {
                                     alert('Não há funcionários de "Manutenção" cadastrados para realizar esta tarefa.');
                                } else {
                                     openServiceModal('maintenance', room.number); 
                                }
                            }
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded border border-black transition-colors ${
                            pendingMaintenance
                            ? 'bg-orange-200 text-orange-800 hover:bg-orange-300 font-bold'
                            : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        }`}
                        title={pendingMaintenance ? "Clique para concluir a manutenção" : "Solicitar Manutenção"}
                    >
                        {pendingMaintenance ? <Check size={16} /> : <Wrench size={16} />}
                        <span className="text-[10px] font-bold mt-1">{pendingMaintenance ? 'Concluir' : 'Manut.'}</span>
                    </button>
                 </div>
              </div>
            );
        })}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-6">Novo Quarto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select required className="w-full p-2 border rounded-lg" value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value as RoomCategory})}>
                  <option value="Standard">Standard (R$ 150)</option>
                  <option value="Luxo">Luxo (R$ 300)</option>
                  <option value="Presidente">Presidente (R$ 600)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (Pessoas)</label>
                <input type="number" min="1" max="10" required className="w-full p-2 border rounded-lg" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-hotel-600 text-white rounded-lg hover:bg-hotel-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Assignment Modal */}
      {serviceModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">
              {serviceModal.type === 'cleaning' ? 'Solicitar Limpeza' : 'Solicitar Manutenção'}
            </h2>
            <p className="text-gray-600 mb-6">
              Selecione o funcionário responsável para o quarto <span className="font-bold">#{serviceModal.roomNumber}</span>:
            </p>
            
            <form onSubmit={handleConfirmService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funcionário Disponível</label>
                <select 
                  required 
                  className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-hotel-500"
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {employees
                    .filter(e => e.role === (serviceModal.type === 'cleaning' ? 'Auxiliar de Limpeza' : 'Manutenção'))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setServiceModal({ isOpen: false, type: null, roomNumber: null });
                    setSelectedEmployeeId('');
                  }} 
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedEmployeeId}
                  className="flex-1 py-2 bg-hotel-600 text-white rounded-lg hover:bg-hotel-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;