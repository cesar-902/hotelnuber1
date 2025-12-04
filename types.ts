export interface Client {
  id: string; // Used as code
  name: string;
  address: string;
  phone: string;
  points: number;
  document: string; // CPF
}

export interface Employee {
  id: string; // Used as code
  name: string;
  email: string; // Added for login
  password: string; // Added for login
  phone: string;
  role: string;
  salary: number;
  document: string; // CPF or CNPJ
  shift: 'Manhã' | 'Tarde' | 'Noite'; // Added for schedule
}

export type RoomCategory = 'Standard' | 'Luxo' | 'Presidente';
export type RoomStatus = 'disponivel' | 'ocupado';

export interface Room {
  number: string;
  capacity: number;
  dailyRate: number;
  status: RoomStatus;
  category: RoomCategory;
}

export interface Charge {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  category: 'restaurant' | 'service' | 'other';
}

export interface Stay {
  id: string;
  clientId: string;
  roomNumber: string;
  checkInDate: string; // ISO Date string
  checkOutDate: string; // ISO Date string
  totalDays: number;
  totalCost: number;
  status: 'active' | 'completed';
  guestCount: number;
  charges: Charge[]; // List of consumables/services
}

export interface ServiceRequest {
  id: string;
  roomNumber: string;
  type: 'cleaning' | 'maintenance';
  employeeId: string; // Who is assigned
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drink' | 'dessert';
  imageUrl: string;
}

// Helper types for the context
export interface HotelContextType {
  clients: Client[];
  employees: Employee[];
  rooms: Room[];
  stays: Stay[];
  serviceRequests: ServiceRequest[];
  menuItems: MenuItem[];
  currentUser: Employee | null;
  loyaltyConfig: { pointsPerDiscount: number };
  
  addClient: (client: Omit<Client, 'id' | 'points'>) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  addRoom: (room: Room) => void;
  createStay: (stayData: { clientId: string; guestCount: number; checkIn: string; checkOut: string; roomNumber: string }) => void;
  checkoutStay: (stayId: string, pointsToUse?: number) => { discount: number; pointsUsed: number; earnedPoints: number } | undefined;
  
  addServiceRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => void;
  completeServiceRequest: (id: string) => void;

  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  addChargeToStay: (stayId: string, description: string, amount: number, category: 'restaurant' | 'service' | 'other') => void;

  searchClients: (query: string) => Client[];
  searchEmployees: (query: string) => Employee[];
  getClientStays: (clientId: string) => Stay[];
  getAvailableRooms: (checkIn: string, checkOut: string, guests: number, category?: RoomCategory) => Room[];
  
  setLoyaltyConfig: (config: { pointsPerDiscount: number }) => void;
  
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
}