import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Search, Calendar, DollarSign, Award } from 'lucide-react';

const StayHistory: React.FC = () => {
  const { stays, clients, rooms } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter for completed stays only
  const completedStays = stays.filter(stay => stay.status === 'completed');

  // Filter based on search term
  const filteredStays = completedStays.filter(stay => {
    const client = clients.find(c => c.id === stay.clientId);
    const clientName = client?.name.toLowerCase() || '';
    const roomNumber = stay.roomNumber.toLowerCase();
    const search = searchTerm.toLowerCase();

    return clientName.includes(search) || roomNumber.includes(search);
  });

  const calculatePoints = (roomNumber: string, totalDays: number) => {
    const room = rooms.find(r => r.number === roomNumber);
    let pointsPerDay = 2; // Standard
    if (room?.category === 'Luxo') pointsPerDay = 4;
    if (room?.category === 'Presidente') pointsPerDay = 8;
    return totalDays * pointsPerDay;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Histórico de Estadias</h2>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm text-gray-500">Total Finalizado: </span>
            <span className="font-bold text-gray-800">{completedStays.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome do hóspede ou número do quarto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hóspede</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos Gerados</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStays.length > 0 ? (
                filteredStays.map((stay) => {
                  const client = clients.find(c => c.id === stay.clientId);
                  const points = calculatePoints(stay.roomNumber, stay.totalDays);
                  
                  return (
                    <tr key={stay.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-hotel-100 flex items-center justify-center text-hotel-600 font-bold mr-3">
                            {client?.name.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{client?.name || 'Cliente Removido'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">Quarto {stay.roomNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-900">
                                {new Date(stay.checkInDate).toLocaleDateString('pt-BR')} - {new Date(stay.checkOutDate).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-xs text-gray-500">{stay.totalDays} dias</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-green-600">
                            <DollarSign size={16} className="mr-1" />
                            {formatCurrency(stay.totalCost)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-purple-600">
                            <Award size={16} className="mr-1" />
                            +{points} pts
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                        <Calendar size={48} className="text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-400">Nenhum histórico encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StayHistory;
