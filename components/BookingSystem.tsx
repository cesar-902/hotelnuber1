import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room, RoomCategory, Client } from '../types';
import { Calendar, CheckCircle, Search, User, X, PlusCircle, Filter } from 'lucide-react';

const BookingSystem: React.FC = () => {
  const { clients, createStay, stays, checkoutStay, getAvailableRooms, searchClients } = useHotel();
  const [activeTab, setActiveTab] = useState<'new' | 'active'>('new');
  
  // Form State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientSearchActive, setIsClientSearchActive] = useState(false);

  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guestCount, setGuestCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | 'All'>('All');
  const [availableRooms, setAvailableRooms] = useState<Room[] | null>(null);
  
  // Result Filter State
  const [resultFilterCategory, setResultFilterCategory] = useState<RoomCategory | 'All'>('All');
  
  // Multi-room selection state
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  // Filter clients for search
  const filteredClients = clientSearchQuery.length > 0 ? searchClients(clientSearchQuery) : [];

  const handleSearchRooms = () => {
    if (!dates.checkIn || !dates.checkOut) {
      alert("Selecione as datas.");
      return;
    }
    // Perform search
    const cat = selectedCategory === 'All' ? undefined : selectedCategory;
    const results = getAvailableRooms(dates.checkIn, dates.checkOut, guestCount, cat);
    
    setAvailableRooms(results);
    setResultFilterCategory(selectedCategory); // Initialize result filter with search selection
    setSelectedRooms([]); // Reset selection on new search
  };

  const toggleRoomSelection = (roomNumber: string) => {
      setSelectedRooms(prev => {
          if (prev.includes(roomNumber)) {
              return prev.filter(r => r !== roomNumber);
          } else {
              return [...prev, roomNumber];
          }
      });
  }

  const handleBooking = () => {
    if (!selectedClient || selectedRooms.length === 0 || !dates.checkIn || !dates.checkOut) return;
    
    try {
        // Create a stay for each selected room
        selectedRooms.forEach(roomNumber => {
            createStay({
                clientId: selectedClient.id,
                roomNumber: roomNumber,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
                guestCount
            });
        });

        alert(`Reserva realizada com sucesso para ${selectedRooms.length} quarto(s)!`);
        
        // Reset
        setAvailableRooms(null);
        setDates({ checkIn: '', checkOut: '' });
        setSelectedRooms([]);
        setSelectedClient(null);
        setClientSearchQuery('');
        setActiveTab('active');
    } catch (e) {
        alert("Erro ao cadastrar estadia");
    }
  };

  const handleCheckout = (stayId: string, cost: number, days: number) => {
    if (window.confirm(`Confirmar checkout?\nTotal a pagar: R$ ${cost.toFixed(2)}\nDias: ${days}`)) {
        checkoutStay(stayId);
    }
  };

  // Filter the displayed results based on the result-specific filter
  const displayedRooms = availableRooms 
    ? availableRooms.filter(r => resultFilterCategory === 'All' || r.category === resultFilterCategory)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        <button 
          className={`pb-2 px-4 font-medium ${activeTab === 'new' ? 'border-b-2 border-hotel-600 text-hotel-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('new')}
        >
          Nova Reserva
        </button>
        <button 
          className={`pb-2 px-4 font-medium ${activeTab === 'active' ? 'border-b-2 border-hotel-600 text-hotel-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('active')}
        >
          Estadias Ativas / Checkout
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dados da Reserva</h2>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              
              {!selectedClient ? (
                  <div className="relative">
                      <input 
                        type="text"
                        className="w-full p-2 pl-8 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-hotel-500"
                        placeholder="Buscar cliente por nome..."
                        value={clientSearchQuery}
                        onChange={e => {
                            setClientSearchQuery(e.target.value);
                            setIsClientSearchActive(true);
                        }}
                        onFocus={() => setIsClientSearchActive(true)}
                      />
                      <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
                      
                      {/* Search Results Dropdown */}
                      {isClientSearchActive && clientSearchQuery.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredClients.length > 0 ? (
                                  filteredClients.map(c => (
                                      <div 
                                        key={c.id}
                                        onClick={() => {
                                            setSelectedClient(c);
                                            setIsClientSearchActive(false);
                                            setClientSearchQuery('');
                                        }}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                      >
                                          <p className="font-bold text-sm text-gray-800">{c.name}</p>
                                          <p className="text-xs text-gray-500">CPF: {c.document}</p>
                                      </div>
                                  ))
                              ) : (
                                  <div className="p-3 text-sm text-gray-500 text-center">Nenhum cliente encontrado</div>
                              )}
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                          <p className="font-bold text-sm text-blue-900">{selectedClient.name}</p>
                          <p className="text-xs text-blue-700">CPF: {selectedClient.document}</p>
                      </div>
                      <button onClick={() => setSelectedClient(null)} className="text-blue-500 hover:text-blue-700">
                          <X size={18} />
                      </button>
                  </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entrada (14:00)</label>
                  <input type="date" className="w-full p-2 border rounded-lg" value={dates.checkIn} onChange={e => setDates({...dates, checkIn: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saída (12:00)</label>
                  <input type="date" className="w-full p-2 border rounded-lg" value={dates.checkOut} onChange={e => setDates({...dates, checkOut: e.target.value})} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hóspedes/Quarto</label>
                    <input type="number" min="1" max="10" className="w-full p-2 border rounded-lg" value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (Busca)</label>
                    <select className="w-full p-2 border rounded-lg" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as any)}>
                        <option value="All">Todas</option>
                        <option value="Standard">Standard</option>
                        <option value="Luxo">Luxo</option>
                        <option value="Presidente">Presidente</option>
                    </select>
                </div>
            </div>

            <button 
                onClick={handleSearchRooms}
                className="w-full bg-gray-800 text-white py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-900"
            >
                <Search size={18} /> Buscar Quartos
            </button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            {availableRooms === null && (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                    <Calendar size={48} className="mb-2" />
                    <p>Preencha os dados e busque quartos disponíveis.</p>
                </div>
            )}
            
            {availableRooms !== null && availableRooms.length === 0 && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                    Nenhum quarto disponível para estes critérios.
                </div>
            )}

            {availableRooms && availableRooms.length > 0 && (
                <>
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-lg border border-gray-100 gap-3">
                    <h3 className="text-lg font-bold text-gray-700">Quartos Disponíveis</h3>
                    
                    {/* Category Result Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select 
                            className="p-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-hotel-500"
                            value={resultFilterCategory}
                            onChange={(e) => setResultFilterCategory(e.target.value as any)}
                        >
                            <option value="All">Mostrar Todos</option>
                            <option value="Standard">Apenas Standard</option>
                            <option value="Luxo">Apenas Luxo</option>
                            <option value="Presidente">Apenas Presidente</option>
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedRooms.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-gray-400">
                            Nenhum quarto desta categoria na busca atual.
                        </div>
                    ) : (
                        displayedRooms.map(room => {
                            const isSelected = selectedRooms.includes(room.number);
                            return (
                                <div 
                                    key={room.number}
                                    onClick={() => toggleRoomSelection(room.number)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all relative ${isSelected ? 'border-hotel-500 ring-2 ring-hotel-200 bg-hotel-50' : 'border-gray-200 bg-white hover:border-hotel-300'}`}
                                >
                                    <div className="absolute top-4 right-4">
                                        {isSelected ? <CheckCircle className="text-hotel-600" size={24} /> : <PlusCircle className="text-gray-300 hover:text-hotel-400" size={24} />}
                                    </div>
                                    <div className="flex justify-between items-start pr-8">
                                        <div>
                                            <h4 className="font-bold text-lg">Quarto {room.number}</h4>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${room.category === 'Presidente' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {room.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <User size={14}/> Max: {room.capacity}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-800">R$ {room.dailyRate}</p>
                                            <p className="text-xs text-gray-500">por noite</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                <div className="sticky bottom-4 bg-white p-4 shadow-lg border border-gray-100 rounded-xl flex justify-between items-center mt-6">
                    <div>
                        <p className="text-sm text-gray-500">Quartos Selecionados: <span className="font-bold text-hotel-800">{selectedRooms.length}</span></p>
                        <p className="text-xs text-gray-400">{selectedRooms.map(r => `#${r}`).join(', ')}</p>
                    </div>
                    <button 
                        disabled={selectedRooms.length === 0 || !selectedClient}
                        onClick={handleBooking}
                        className="bg-hotel-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hotel-700 text-white px-8 py-3 rounded-lg font-bold"
                    >
                        Confirmar Reserva ({selectedRooms.length})
                    </button>
                </div>
                </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'active' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                        <th className="px-6 py-4">Quarto</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Período</th>
                        <th className="px-6 py-4">Total Atual</th>
                        <th className="px-6 py-4">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stays.filter(s => s.status === 'active').map(stay => {
                        const client = clients.find(c => c.id === stay.clientId);
                        return (
                            <tr key={stay.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-800">#{stay.roomNumber}</td>
                                <td className="px-6 py-4">{client?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(stay.checkInDate).toLocaleDateString()} a {new Date(stay.checkOutDate).toLocaleDateString()}
                                    <br/>
                                    <span className="text-xs text-gray-400">({stay.totalDays} diárias)</span>
                                </td>
                                <td className="px-6 py-4 font-mono font-medium text-hotel-700">R$ {stay.totalCost.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleCheckout(stay.id, stay.totalCost, stay.totalDays)}
                                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <CheckCircle size={14} /> Checkout
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    {stays.filter(s => s.status === 'active').length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma estadia ativa no momento.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default BookingSystem;