import React, { useState, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { Plus, Utensils, Coffee, ShoppingCart, Check, Upload, X } from 'lucide-react';
import { MenuItem } from '../types';

const RestaurantMenu: React.FC = () => {
  const { menuItems, addMenuItem, stays, clients, addChargeToStay } = useHotel();
  const [filter, setFilter] = useState<'all' | 'food' | 'drink' | 'dessert'>('all');
  const [showModal, setShowModal] = useState(false);
  
  // State for Ordering
  const [orderModal, setOrderModal] = useState<{ isOpen: boolean; item: MenuItem | null }>({ isOpen: false, item: null });
  const [selectedStayId, setSelectedStayId] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'food' as 'food' | 'drink' | 'dessert',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = menuItems.filter(item => filter === 'all' || item.category === filter);
  
  // Get active stays for the dropdown
  const activeStays = stays.filter(s => s.status === 'active');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image to 500x500
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 500;
        canvas.height = 500;
        
        // Calculate dimensions to maintain aspect ratio and cover the square
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        
        const aspectRatio = img.width / img.height;
        
        if (aspectRatio > 1) {
          // Landscape - crop width
          sourceWidth = img.height;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          // Portrait - crop height
          sourceHeight = img.width;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        ctx?.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, 500, 500);
        
        // Convert to base64
        const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(resizedImageUrl);
        setFormData({...formData, imageUrl: resizedImageUrl});
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert('Por favor, adicione uma imagem.');
      return;
    }
    
    if (formData.price < 1.00) {
      alert('O preço deve ser no mínimo R$ 1,00.');
      return;
    }
    
    addMenuItem({
        ...formData,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
    });
    setShowModal(false);
    setFormData({ name: '', description: '', price: 0, category: 'food', imageUrl: '' });
    setImagePreview('');
  };

  const handleOrder = (e: React.FormEvent) => {
      e.preventDefault();
      if (!orderModal.item || !selectedStayId) return;

      const totalAmount = orderModal.item.price * quantity;
      const desc = `${quantity}x ${orderModal.item.name}`;

      addChargeToStay(selectedStayId, desc, totalAmount, 'restaurant');
      
      alert(`Pedido enviado com sucesso!\n${desc}\nValor: R$ ${totalAmount.toFixed(2)} adicionado à conta do quarto.`);
      
      setOrderModal({ isOpen: false, item: null });
      setSelectedStayId('');
      setQuantity(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Restaurante & Bar</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-hotel-600 hover:bg-hotel-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Adicionar Item
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full font-medium ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}>Todos</button>
        <button onClick={() => setFilter('food')} className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${filter === 'food' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}><Utensils size={16}/> Comidas</button>
        <button onClick={() => setFilter('drink')} className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${filter === 'drink' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}><Coffee size={16}/> Bebidas</button>
        <button onClick={() => setFilter('dessert')} className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${filter === 'dessert' ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'}`}><Coffee size={16}/> Sobremesas</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
            <div 
                key={item.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => setOrderModal({ isOpen: true, item })}
            >
                <div className="h-48 overflow-hidden relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${item.category === 'food' ? 'bg-orange-500' : item.category === 'drink' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {item.category === 'food' ? 'Comida' : item.category === 'drink' ? 'Bebida' : 'Sobremesa'}
                    </span>
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-gray-900 font-bold px-4 py-2 rounded-full flex items-center gap-2">
                            <ShoppingCart size={16}/> Adicionar ao Quarto
                        </span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800 leading-tight">{item.name}</h3>
                        <span className="font-bold text-green-700">R$ {item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Novo Item do Menu</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Prato/Bebida</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea required className="w-full p-2 border rounded-lg" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" min="1.00" required className="w-full p-2 border rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                    <p className="text-xs text-gray-500 mt-1">Mínimo: R$ 1,00</p>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select required className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                        <option value="food">Comida</option>
                        <option value="drink">Bebida</option>
                        <option value="dessert">Sobremesa</option>
                    </select>
                 </div>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inserir Imagem <span className="text-xs text-gray-500">(500x500px)</span>
                </label>
                
                {!imagePreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-hotel-500 hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600 font-medium">Clique para selecionar uma imagem</p>
                    <p className="text-xs text-gray-400 mt-1">A imagem será redimensionada para 500x500px</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({...formData, imageUrl: ''});
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X size={16} />
                    </button>
                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-hotel-600 hover:text-hotel-800 font-medium"
                      >
                        Trocar imagem
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setImagePreview('');
                  setFormData({ name: '', description: '', price: 0, category: 'food', imageUrl: '' });
                }} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-hotel-600 text-white rounded-lg hover:bg-hotel-700">Salvar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order to Room Modal */}
      {orderModal.isOpen && orderModal.item && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
                <h2 className="text-xl font-bold mb-2">Adicionar à Conta</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-4 flex gap-4 items-center">
                    <img src={orderModal.item.imageUrl} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                        <p className="font-bold">{orderModal.item.name}</p>
                        <p className="text-green-700 font-medium">R$ {orderModal.item.price.toFixed(2)}</p>
                    </div>
                </div>

                <form onSubmit={handleOrder} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Quarto / Hóspede</label>
                        <select 
                            required 
                            className="w-full p-2 border rounded-lg"
                            value={selectedStayId}
                            onChange={e => setSelectedStayId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {activeStays.map(stay => {
                                const client = clients.find(c => c.id === stay.clientId);
                                return (
                                    <option key={stay.id} value={stay.id}>
                                        Quarto {stay.roomNumber} - {client?.name || 'Hóspede'}
                                    </option>
                                );
                            })}
                        </select>
                        {activeStays.length === 0 && <p className="text-xs text-red-500 mt-1">Nenhum quarto ocupado no momento.</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                        <div className="flex items-center gap-4">
                             <input 
                                type="number" 
                                min="1" 
                                max="20" 
                                className="w-20 p-2 border rounded-lg text-center"
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                             />
                             <span className="text-gray-500 text-sm">Total: R$ {(orderModal.item.price * quantity).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setOrderModal({isOpen: false, item: null})} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" disabled={!selectedStayId} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold flex justify-center items-center gap-2">
                            <Check size={18} /> Confirmar
                        </button>
                    </div>
                </form>
             </div>
          </div>
      )}
    </div>
  );
};

export default RestaurantMenu;