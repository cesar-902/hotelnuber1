import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Plus, Search, UserCog, Clock, Calendar, Coffee } from 'lucide-react';
import { Employee } from '../types';

const EmployeeList: React.FC = () => {
  const { employees, addEmployee, searchEmployees } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // State for Schedule Modal
  const [selectedEmployeeSchedule, setSelectedEmployeeSchedule] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    salary: 0,
    document: '',
    shift: 'Manhã' as 'Manhã' | 'Tarde' | 'Noite'
  });

  const filtered = searchTerm ? searchEmployees(searchTerm) : employees;

  const validatePassword = (pwd: string) => {
    // At least 8 chars, 1 number, 1 special char
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
        alert("A senha é muito fraca. Deve ter no mínimo 8 caracteres, 1 número e 1 caractere especial.");
        return;
    }

    try {
        addEmployee(formData);
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', phone: '', role: '', salary: 0, document: '', shift: 'Manhã' });
    } catch (e: any) {
        alert(e.message || "Erro ao cadastrar funcionário.");
    }
  };

  // Helper to generate schedule based on shift
  const getScheduleDetails = (shift: string) => {
    switch(shift) {
        case 'Manhã':
            return {
                start: '07:00',
                end: '16:00',
                breakStart: '12:00',
                breakEnd: '13:00'
            };
        case 'Tarde':
            return {
                start: '14:00',
                end: '23:00',
                breakStart: '18:00',
                breakEnd: '19:00'
            };
        case 'Noite':
            return {
                start: '23:00',
                end: '07:00',
                breakStart: '03:00',
                breakEnd: '04:00'
            };
        default:
            return { start: '08:00', end: '17:00', breakStart: '12:00', breakEnd: '13:00' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Funcionários</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-hotel-600 hover:bg-hotel-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Novo Funcionário
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar funcionário..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-hotel-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(emp => (
          <div 
            key={emp.id} 
            onClick={() => setSelectedEmployeeSchedule(emp)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-hotel-300 transition-all group relative"
            title="Clique para ver a escala de trabalho"
          >
            <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-purple-200">
              <UserCog size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800">{emp.name}</h3>
              <p className="text-hotel-600 font-medium text-sm mb-2">{emp.role}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>ID: #{emp.id}</p>
                <p>Email: {emp.email}</p>
                <p className="flex items-center gap-1"><Clock size={12}/> Turno: {emp.shift || 'Manhã'}</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Calendar className="text-hotel-500" size={20} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">Nenhum funcionário encontrado.</div>
        )}
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Cadastrar Funcionário</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login)</label>
                    <input type="email" required className="w-full p-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
                    <input type="text" required className="w-full p-2 border rounded-lg" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input type="password" required className="w-full p-2 border rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                <p className="text-[10px] text-gray-500 mt-1">
                    Mínimo 8 caracteres, 1 número e 1 caractere especial (!@#$%^&*).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <select required className="w-full p-2 border rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Auxiliar de Limpeza">Auxiliar de Limpeza</option>
                    <option value="Garçom">Garçom</option>
                    <option value="Manutenção">Manutenção</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                    <select required className="w-full p-2 border rounded-lg" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value as any})}>
                    <option value="Manhã">Manhã (07:00 - 16:00)</option>
                    <option value="Tarde">Tarde (14:00 - 23:00)</option>
                    <option value="Noite">Noite (23:00 - 07:00)</option>
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salário (R$)</label>
                <input type="number" required className="w-full p-2 border rounded-lg" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-hotel-600 text-white rounded-lg hover:bg-hotel-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Details Modal */}
      {selectedEmployeeSchedule && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full">
              <div className="bg-hotel-900 p-6 flex justify-between items-center text-white">
                  <div>
                      <h2 className="text-2xl font-bold">{selectedEmployeeSchedule.name}</h2>
                      <p className="text-hotel-300 opacity-90">{selectedEmployeeSchedule.role} • Escala 6x1</p>
                  </div>
                  <button onClick={() => setSelectedEmployeeSchedule(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">✕</button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200 text-sm">
                    <Coffee size={18} />
                    <span><strong>Descanso Obrigatório:</strong> Todos os turnos incluem 1 hora de intervalo para refeição e descanso conforme CLT.</span>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3">Dia da Semana</th>
                                <th className="p-3">Entrada</th>
                                <th className="p-3">Saída</th>
                                <th className="p-3">Intervalo (Descanso)</th>
                                <th className="p-3 text-right">Carga Horária</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => {
                                const sched = getScheduleDetails(selectedEmployeeSchedule.shift || 'Manhã');
                                return (
                                    <tr key={day} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium">{day}</td>
                                        <td className="p-3 text-green-700">{sched.start}</td>
                                        <td className="p-3 text-red-700">{sched.end}</td>
                                        <td className="p-3 text-gray-600 flex items-center gap-1">
                                            <Coffee size={14} className="text-orange-400"/> {sched.breakStart} - {sched.breakEnd}
                                        </td>
                                        <td className="p-3 text-right font-bold text-gray-800">8h</td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-gray-50">
                                <td className="p-3 font-medium text-gray-500">Domingo</td>
                                <td colSpan={4} className="p-3 text-center text-hotel-600 font-bold uppercase tracking-widest">Folga Semanal</td>
                            </tr>
                        </tbody>
                        <tfoot className="bg-gray-100">
                            <tr>
                                <td colSpan={4} className="p-3 text-right font-bold">Total Semanal:</td>
                                <td className="p-3 text-right font-bold text-lg">48h*</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-right">*Incluindo horas de intervalo remuneradas/não-remuneradas conforme contrato específico.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;