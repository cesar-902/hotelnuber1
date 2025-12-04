import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Client, Employee, Room, Stay, HotelContextType, RoomCategory, ServiceRequest, MenuItem, Charge } from '../types';

const HotelContext = createContext<HotelContextType | undefined>(undefined);

const STORAGE_KEY = 'hotel_descanso_garantido_db';

// Initial Mock Data
const INITIAL_ROOMS: Room[] = [
  { number: '101', capacity: 2, dailyRate: 150, status: 'disponivel', category: 'Standard' },
  { number: '102', capacity: 2, dailyRate: 150, status: 'disponivel', category: 'Standard' },
  { number: '201', capacity: 3, dailyRate: 300, status: 'disponivel', category: 'Luxo' },
  { number: '202', capacity: 4, dailyRate: 300, status: 'disponivel', category: 'Luxo' },
  { number: '301', capacity: 2, dailyRate: 600, status: 'disponivel', category: 'Presidente' },
];

const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'X-Bacon Artesanal', description: 'Pão brioche, burger 180g, bacon crocante, queijo cheddar.', price: 35.00, category: 'food', imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500' },
  { id: '2', name: 'Filé a Parmegiana', description: 'Acompanha arroz e fritas. Serve 2 pessoas.', price: 89.90, category: 'food', imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500' },
  { id: '3', name: 'Caipirinha de Limão', description: 'Cachaça artesanal, limão taiti e açúcar.', price: 22.00, category: 'drink', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
  { id: '4', name: 'Refrigerante Lata', description: 'Coca-cola, Guaraná, Fanta.', price: 8.00, category: 'drink', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
];

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [stays, setStays] = useState<Stay[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setClients(data.clients || []);
      
      let loadedEmployees = data.employees || [];
      // Ensure there is at least one Manager so the system is usable
      const hasValidAdmin = loadedEmployees.some((e: Employee) => e.role === 'Gerente' && e.email && e.password);

      if (!hasValidAdmin || loadedEmployees.length === 0) {
        const defaultAdmin: Employee = {
            id: 'ADM001',
            name: 'Administrador Padrão',
            email: 'admin@hotel.com',
            password: 'admin',
            role: 'Gerente',
            phone: '0000-0000',
            salary: 5000,
            document: '000.000.000-00',
            shift: 'Manhã'
        };
        if (loadedEmployees.length === 0) {
            loadedEmployees = [defaultAdmin];
        } else {
             if(!hasValidAdmin) loadedEmployees.push(defaultAdmin);
        }
      }
      setEmployees(loadedEmployees);
      
      setRooms(data.rooms || INITIAL_ROOMS);
      setStays(data.stays || []);
      setServiceRequests(data.serviceRequests || []);
      setMenuItems(data.menuItems || INITIAL_MENU);
    } else {
        // First run initialization
        const defaultAdmin: Employee = {
            id: 'ADM001',
            name: 'Administrador Padrão',
            email: 'admin@hotel.com',
            password: 'admin',
            role: 'Gerente',
            phone: '0000-0000',
            salary: 5000,
            document: '000.000.000-00',
            shift: 'Manhã'
        };
        setEmployees([defaultAdmin]);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ clients, employees, rooms, stays, serviceRequests, menuItems }));
  }, [clients, employees, rooms, stays, serviceRequests, menuItems]);


  const addClient = (data: Omit<Client, 'id' | 'points'>) => {
    const newClient: Client = { ...data, id: generateId(), points: 0 };
    setClients(prev => [...prev, newClient]);
  };

  const addEmployee = (data: Omit<Employee, 'id'>) => {
    const safeEmail = data.email.trim().toLowerCase();
    const safeDoc = data.document.trim();

    // Basic check for unique email
    if (employees.some(e => e.email.toLowerCase() === safeEmail)) {
        throw new Error("Email já cadastrado.");
    }

    // Basic check for unique document (CPF/CNPJ)
    if (employees.some(e => e.document === safeDoc)) {
        throw new Error("CPF/CNPJ já cadastrado.");
    }

    // Default shift if not provided (for safety)
    const empData = { 
        ...data, 
        email: safeEmail,
        document: safeDoc,
        shift: data.shift || 'Manhã' 
    };

    const newEmployee: Employee = { ...empData, id: generateId() };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const addRoom = (room: Room) => {
    if (rooms.some(r => r.number === room.number)) {
      alert('Erro: Já existe um quarto com este número.');
      return;
    }
    setRooms(prev => [...prev, room]);
  };

  const addServiceRequest = (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: ServiceRequest = {
        ...req,
        id: generateId(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    setServiceRequests(prev => [...prev, newRequest]);
  }

  const completeServiceRequest = (id: string) => {
    setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
  }

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    setMenuItems(prev => [...prev, { ...item, id: generateId() }]);
  };

  const addChargeToStay = (stayId: string, description: string, amount: number, category: 'restaurant' | 'service' | 'other') => {
      const newCharge: Charge = {
          id: generateId(),
          description,
          amount,
          category,
          createdAt: new Date().toISOString()
      };

      setStays(prev => prev.map(stay => {
          if (stay.id === stayId) {
              return {
                  ...stay,
                  charges: [...(stay.charges || []), newCharge]
              };
          }
          return stay;
      }));
  };

  const createStay = ({ clientId, guestCount, checkIn, checkOut, roomNumber }: { clientId: string; guestCount: number; checkIn: string; checkOut: string; roomNumber: string }) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Validate Room
    const room = rooms.find(r => r.number === roomNumber);
    if (!room) throw new Error("Quarto não encontrado");

    // Initial total cost only includes room rate. Charges are added later.
    const totalCost = diffDays * room.dailyRate;

    const newStay: Stay = {
      id: generateId(),
      clientId,
      roomNumber,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalDays: diffDays,
      totalCost, // This is the base cost estimate
      status: 'active',
      guestCount,
      charges: [] // Initialize empty charges
    };

    setStays(prev => [...prev, newStay]);
    
    // Update room status
    setRooms(prev => prev.map(r => r.number === roomNumber ? { ...r, status: 'ocupado' } : r));
  };

  const checkoutStay = (stayId: string) => {
    const stay = stays.find(s => s.id === stayId);
    if (!stay || stay.status === 'completed') return;

    // Determine Room Category and Points Multiplier
    const room = rooms.find(r => r.number === stay.roomNumber);
    let pointsPerDay = 1; // Standard

    if (room) {
        if (room.category === 'Luxo') pointsPerDay = 2; // Doubles Standard
        if (room.category === 'Presidente') pointsPerDay = 4; // Doubles Luxo
    }
    
    const earnedPoints = stay.totalDays * pointsPerDay;

    // Recalculate Final Cost (Room Rate * Days + Charges)
    const extraCharges = (stay.charges || []).reduce((acc, curr) => acc + curr.amount, 0);
    const finalTotalCost = (stay.totalDays * (room?.dailyRate || 0)) + extraCharges;

    // Update Stay status and finalize cost
    setStays(prev => prev.map(s => s.id === stayId ? { ...s, status: 'completed', totalCost: finalTotalCost } : s));

    // Free up room but mark as dirty (via Service Request)
    setRooms(prev => prev.map(r => r.number === stay.roomNumber ? { ...r, status: 'disponivel' } : r));

    // Create Cleaning Request automatically
    addServiceRequest({
        roomNumber: stay.roomNumber,
        type: 'cleaning',
        employeeId: '' // Unassigned
    });

    // Add Loyalty Points
    setClients(prev => prev.map(c => {
      if (c.id === stay.clientId) {
        return { ...c, points: c.points + earnedPoints };
      }
      return c;
    }));
  };

  const searchClients = (query: string) => {
    const lower = query.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(lower) || c.id.toLowerCase().includes(lower));
  };

  const searchEmployees = (query: string) => {
    const lower = query.toLowerCase();
    return employees.filter(e => e.name.toLowerCase().includes(lower) || e.id.toLowerCase().includes(lower));
  };

  const getClientStays = (clientId: string) => {
    return stays.filter(s => s.clientId === clientId);
  };

  const getAvailableRooms = (checkIn: string, checkOut: string, guests: number, category?: RoomCategory) => {
    const reqStart = new Date(checkIn).getTime();
    const reqEnd = new Date(checkOut).getTime();

    return rooms.filter(room => {
      // 1. Capacity Check
      if (room.capacity < guests) return false;
      
      // 2. Category Check (optional)
      if (category && room.category !== category) return false;

      // 3. Availability Check (Time overlap)
      const roomStays = stays.filter(s => s.roomNumber === room.number && s.status === 'active');
      
      const hasOverlap = roomStays.some(s => {
        const stayStart = new Date(s.checkInDate).getTime();
        const stayEnd = new Date(s.checkOutDate).getTime();
        
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        return (reqStart < stayEnd && reqEnd > stayStart);
      });

      return !hasOverlap;
    });
  };

  const login = (identifier: string, password: string): boolean => {
    const cleanId = identifier.trim();
    // Allows login by Email OR Document (CPF/CNPJ)
    const emp = employees.find(e => 
        (e.email.toLowerCase() === cleanId.toLowerCase() || e.document === cleanId) && 
        e.password === password
    );
    if (emp) {
        setCurrentUser(emp);
        return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  }

  return (
    <HotelContext.Provider value={{
      clients, employees, rooms, stays, serviceRequests, currentUser, menuItems,
      addClient, addEmployee, addRoom, createStay, checkoutStay,
      addServiceRequest, completeServiceRequest, addMenuItem, addChargeToStay,
      searchClients, searchEmployees, getClientStays, getAvailableRooms,
      login, logout
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error("useHotel must be used within a HotelProvider");
  return context;
};