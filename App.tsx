import React, { useState, useEffect } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { LayoutDashboard, Users, UserCog, Bed, CalendarRange, Menu, Lock, LogOut, Utensils } from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import EmployeeList from './components/EmployeeList';
import RoomList from './components/RoomList';
import BookingSystem from './components/BookingSystem';
import RestaurantMenu from './components/RestaurantMenu';
import AuthScreen from './components/AuthScreen';

type View = 'dashboard' | 'clients' | 'employees' | 'rooms' | 'bookings' | 'restaurant';

const MainApp: React.FC = () => {
  const { currentUser, logout } = useHotel();
  const [currentView, setCurrentView] = useState<View>('rooms'); // Default to a safe view
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine Permissions based on Role
  const getAllowedViews = (role: string): View[] => {
      switch(role) {
          case 'Gerente':
              return ['dashboard', 'clients', 'bookings', 'rooms', 'employees', 'restaurant'];
          case 'Recepcionista':
              return ['clients', 'rooms', 'restaurant'];
          case 'Garçom':
              return ['restaurant', 'rooms'];
          case 'Auxiliar de Limpeza':
          case 'Manutenção':
              return ['rooms'];
          default:
              return [];
      }
  }

  const allowedViews = currentUser ? getAllowedViews(currentUser.role) : [];

  // Reset view if current view is not allowed
  useEffect(() => {
    if (currentUser && !allowedViews.includes(currentView)) {
        // Set to the first allowed view
        if (allowedViews.length > 0) setCurrentView(allowedViews[0]);
    }
  }, [currentUser, allowedViews, currentView]);


  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => {
    const isAllowed = allowedViews.includes(view);
    
    return (
        <button
        disabled={!isAllowed}
        onClick={() => {
            if (isAllowed) {
                setCurrentView(view);
                setIsMobileMenuOpen(false);
            }
        }}
        className={`w-full flex items-center justify-between px-6 py-4 transition-colors relative ${
            currentView === view 
            ? 'bg-hotel-800 text-white border-r-4 border-cyan-400' 
            : 'text-hotel-100'
        } ${!isAllowed ? 'opacity-50 cursor-not-allowed bg-hotel-900/50' : 'hover:bg-hotel-800 hover:text-white'}`}
        >
        <div className="flex items-center space-x-3">
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </div>
        {!isAllowed && <Lock size={16} className="text-gray-400" />}
        </button>
    );
  };

  return (
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-hotel-900 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-24 flex items-center justify-start px-6 border-b border-hotel-800 gap-3">
             <img 
                src="https://cdn-icons-png.flaticon.com/512/3195/3195304.png" 
                alt="Logo Hotel" 
                className="w-10 h-10 rounded-full bg-white p-1"
             />
             <div>
                <h1 className="text-lg font-bold tracking-wider leading-none">DESCANSO</h1>
                <p className="text-[10px] text-hotel-300 tracking-[0.2em]">GARANTIDO</p>
             </div>
          </div>
          
          <div className="p-4 bg-hotel-800/50 mb-2">
            <p className="text-xs text-hotel-300 uppercase font-bold">Usuário</p>
            <p className="font-bold truncate">{currentUser?.name}</p>
            <p className="text-xs text-hotel-200">{currentUser?.role}</p>
          </div>

          <nav className="mt-2 space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Visão Geral" />
            <NavItem view="clients" icon={Users} label="Clientes" />
            <NavItem view="bookings" icon={CalendarRange} label="Estadias" />
            <NavItem view="restaurant" icon={Utensils} label="Restaurante" />
            <NavItem view="rooms" icon={Bed} label="Quartos" />
            <NavItem view="employees" icon={UserCog} label="Funcionários" />
          </nav>

          <div className="absolute bottom-0 w-full">
            <button onClick={logout} className="w-full p-4 flex items-center gap-2 text-hotel-200 hover:text-white hover:bg-hotel-800 transition-colors">
                <LogOut size={20} /> Sair do Sistema
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header Mobile */}
          <header className="bg-white shadow-sm lg:hidden flex items-center justify-between p-4 z-40">
            <div className="flex items-center gap-2">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/3195/3195304.png" 
                    alt="Logo Hotel" 
                    className="w-8 h-8 rounded-full bg-hotel-50 p-1"
                />
                <span className="font-bold text-hotel-900">Descanso Garantido</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
              <Menu size={24} />
            </button>
          </header>

          {/* Scrollable Area */}
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              {currentView === 'dashboard' && allowedViews.includes('dashboard') && <Dashboard />}
              {currentView === 'clients' && allowedViews.includes('clients') && <ClientList />}
              {currentView === 'employees' && allowedViews.includes('employees') && <EmployeeList />}
              {currentView === 'rooms' && allowedViews.includes('rooms') && <RoomList />}
              {currentView === 'bookings' && allowedViews.includes('bookings') && <BookingSystem />}
              {currentView === 'restaurant' && allowedViews.includes('restaurant') && <RestaurantMenu />}
            </div>
          </main>
        </div>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
  );
};

const App: React.FC = () => {
    return (
        <HotelProvider>
            <AuthWrapper />
        </HotelProvider>
    )
}

// Wrapper to access context
const AuthWrapper: React.FC = () => {
    const { currentUser } = useHotel();
    return currentUser ? <MainApp /> : <AuthScreen />;
}

export default App;