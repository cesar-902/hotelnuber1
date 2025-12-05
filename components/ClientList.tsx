import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import {
  Plus,
  Search,
  Trophy,
  History,
  CheckCircle,
  CreditCard,
  Banknote,
  QrCode,
  Utensils,
  BedDouble,
  Calendar,
  User,
  X,
  PlusCircle,
  Filter,
} from "lucide-react";
import { Client, Stay, Room, RoomCategory } from "../types";

const ClientList: React.FC = () => {
  const {
    clients,
    addClient,
    searchClients,
    getClientStays,
    checkoutStay,
    rooms,
    createStay,
    stays,
    getAvailableRooms,
    loyaltyConfig,
  } = useHotel();
  const [activeTab, setActiveTab] = useState<"list" | "booking" | "history">(
    "list"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [historySortOrder, setHistorySortOrder] = useState<
    "date-desc" | "date-asc" | "name-asc" | "name-desc"
  >("date-desc");

  // Checkout Modal State
  const [checkoutData, setCheckoutData] = useState<{
    client: Client;
    stay: Stay;
    roomRate: number;
    totalExtras: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    document: "",
    cep: "",
  });

  // Validation Helpers
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/[^\d]+/g, "");
    if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++)
      sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++)
      sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
  };

  // Booking Form State
  const [selectedBookingClient, setSelectedBookingClient] =
    useState<Client | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isClientSearchActive, setIsClientSearchActive] = useState(false);
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guestCount, setGuestCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<
    RoomCategory | "All"
  >("All");
  const [availableRooms, setAvailableRooms] = useState<Room[] | null>(null);
  const [resultFilterCategory, setResultFilterCategory] = useState<
    RoomCategory | "All"
  >("All");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const filteredClients = searchTerm ? searchClients(searchTerm) : clients;
  const filteredBookingClients =
    clientSearchQuery.length > 0 ? searchClients(clientSearchQuery) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCPF(formData.document)) {
      alert("CPF Inválido! Por favor verifique.");
      return;
    }

    if (formData.phone.length < 14) {
      // (XX) XXXXX-XXXX is 15 chars, (XX) XXXX-XXXX is 14
      alert("Telefone incompleto.");
      return;
    }

    addClient(formData);
    setShowModal(false);
    setFormData({ name: "", address: "", phone: "", document: "", cep: "" });
  };

  const initiateCheckout = (client: Client) => {
    const stays = getClientStays(client.id);
    const activeStay = stays.find((s) => s.status === "active");

    if (activeStay) {
      const room = rooms.find((r) => r.number === activeStay.roomNumber);
      const roomRate = room ? room.dailyRate * activeStay.totalDays : 0;
      const totalExtras = (activeStay.charges || []).reduce(
        (acc, curr) => acc + curr.amount,
        0
      );

      setCheckoutData({
        client,
        stay: activeStay,
        roomRate,
        totalExtras,
      });
    }
  };

  const handlePayment = (method: string) => {
    if (!checkoutData) return;

    const result = checkoutStay(checkoutData.stay.id, pointsToUse);

    if (result) {
      const message =
        `Pagamento realizado via ${method}.\n\n` +
        `✅ Checkout concluído com sucesso!\n\n` +
        `💰 Total pago: R$ ${
          checkoutData.roomRate + checkoutData.totalExtras - result.discount
        }\n` +
        `${
          result.discount > 0
            ? `🎁 Desconto (${pointsToUse} pontos): -R$ ${result.discount.toFixed(
                2
              )}\n`
            : ""
        }` +
        `⭐ Pontos ganhos: +${result.earnedPoints}\n` +
        `${
          result.pointsUsed > 0
            ? `📉 Pontos usados: -${result.pointsUsed}\n`
            : ""
        }`;

      alert(message);
    } else {
      alert(
        `Pagamento realizado via ${method}.\nCheckout concluído com sucesso!`
      );
    }

    setCheckoutData(null);
    setPointsToUse(0);
  };

  // Booking Functions
  const handleSearchRooms = () => {
    if (!dates.checkIn || !dates.checkOut) {
      alert("Selecione as datas.");
      return;
    }
    const cat = selectedCategory === "All" ? undefined : selectedCategory;
    const results = getAvailableRooms(
      dates.checkIn,
      dates.checkOut,
      guestCount,
      cat
    );

    setAvailableRooms(results);
    setResultFilterCategory(selectedCategory);
    setSelectedRooms([]);
  };

  const toggleRoomSelection = (roomNumber: string) => {
    setSelectedRooms((prev) => {
      if (prev.includes(roomNumber)) {
        return prev.filter((r) => r !== roomNumber);
      } else {
        return [...prev, roomNumber];
      }
    });
  };

  const handleBooking = () => {
    if (
      !selectedBookingClient ||
      selectedRooms.length === 0 ||
      !dates.checkIn ||
      !dates.checkOut
    )
      return;

    try {
      selectedRooms.forEach((roomNumber) => {
        createStay({
          clientId: selectedBookingClient.id,
          roomNumber: roomNumber,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guestCount,
        });
      });

      alert(
        `Reserva realizada com sucesso para ${selectedRooms.length} quarto(s)!`
      );

      // Reset
      setAvailableRooms(null);
      setDates({ checkIn: "", checkOut: "" });
      setSelectedRooms([]);
      setSelectedBookingClient(null);
      setClientSearchQuery("");
      setActiveTab("list");
    } catch (e) {
      alert("Erro ao cadastrar estadia");
    }
  };

  const displayedRooms = availableRooms
    ? availableRooms.filter(
        (r) =>
          resultFilterCategory === "All" || r.category === resultFilterCategory
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "list"
              ? "border-b-2 border-hotel-600 text-hotel-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("list")}
        >
          Lista de Clientes
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "booking"
              ? "border-b-2 border-hotel-600 text-hotel-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("booking")}
        >
          Nova Reserva
        </button>
      </div>

      {/* Client List Tab */}
      {activeTab === "list" && (
        <>
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
                {filteredClients.map((client) => {
                  const hasActiveStay = getClientStays(client.id).some(
                    (s) => s.status === "active"
                  );

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-gray-500">
                        #{client.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {client.document || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {client.phone}
                      </td>
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
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Booking Tab */}
      {activeTab === "booking" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Dados da Reserva
            </h2>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>

              {!selectedBookingClient ? (
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2 pl-8 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-hotel-500"
                    placeholder="Buscar cliente por nome..."
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setIsClientSearchActive(true);
                    }}
                    onFocus={() => setIsClientSearchActive(true)}
                  />
                  <Search
                    className="absolute left-2 top-2.5 text-gray-400"
                    size={16}
                  />

                  {/* Search Results Dropdown */}
                  {isClientSearchActive && clientSearchQuery.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredBookingClients.length > 0 ? (
                        filteredBookingClients.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedBookingClient(c);
                              setIsClientSearchActive(false);
                              setClientSearchQuery("");
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                          >
                            <p className="font-bold text-sm text-gray-800">
                              {c.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              CPF: {c.document}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          Nenhum cliente encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="font-bold text-sm text-blue-900">
                      {selectedBookingClient.name}
                    </p>
                    <p className="text-xs text-blue-700">
                      CPF: {selectedBookingClient.document}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBookingClient(null)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entrada (14:00)
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={dates.checkIn}
                  onChange={(e) =>
                    setDates({ ...dates, checkIn: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saída (12:00)
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={dates.checkOut}
                  onChange={(e) =>
                    setDates({ ...dates, checkOut: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hóspedes/Quarto
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full p-2 border rounded-lg"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria (Busca)
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                >
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
                  <h3 className="text-lg font-bold text-gray-700">
                    Quartos Disponíveis
                  </h3>

                  {/* Category Result Filter */}
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      className="p-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-hotel-500"
                      value={resultFilterCategory}
                      onChange={(e) =>
                        setResultFilterCategory(e.target.value as any)
                      }
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
                    displayedRooms.map((room) => {
                      const isSelected = selectedRooms.includes(room.number);
                      return (
                        <div
                          key={room.number}
                          onClick={() => toggleRoomSelection(room.number)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                            isSelected
                              ? "border-hotel-500 ring-2 ring-hotel-200 bg-hotel-50"
                              : "border-gray-200 bg-white hover:border-hotel-300"
                          }`}
                        >
                          <div className="absolute top-4 right-4">
                            {isSelected ? (
                              <CheckCircle
                                className="text-hotel-600"
                                size={24}
                              />
                            ) : (
                              <PlusCircle
                                className="text-gray-300 hover:text-hotel-400"
                                size={24}
                              />
                            )}
                          </div>
                          <div className="flex justify-between items-start pr-8">
                            <div>
                              <h4 className="font-bold text-lg">
                                Quarto {room.number}
                              </h4>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-bold ${
                                  room.category === "Presidente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {room.category}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between items-end">
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <User size={14} /> Max: {room.capacity}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-800">
                                R$ {room.dailyRate}
                              </p>
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
                    <p className="text-sm text-gray-500">
                      Quartos Selecionados:{" "}
                      <span className="font-bold text-hotel-800">
                        {selectedRooms.length}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedRooms.map((r) => `#${r}`).join(", ")}
                    </p>
                  </div>
                  <button
                    disabled={
                      selectedRooms.length === 0 || !selectedBookingClient
                    }
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

      {/* History Tab */}
      {activeTab === "history" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Histórico de Estadias
            </h1>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Ordenar:
              </label>
              <select
                className="p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-hotel-500"
                value={historySortOrder}
                onChange={(e) => setHistorySortOrder(e.target.value as any)}
              >
                <option value="date-desc">Data (Mais recente)</option>
                <option value="date-asc">Data (Mais antiga)</option>
                <option value="name-asc">Cliente (A-Z)</option>
                <option value="name-desc">Cliente (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente, quarto ou código..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-hotel-500"
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm font-semibold">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Quarto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Período</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  // Filter completed stays
                  let completedStays = stays.filter(
                    (s) => s.status === "completed"
                  );

                  // Apply search filter
                  if (historySearchTerm) {
                    const searchLower = historySearchTerm.toLowerCase();
                    completedStays = completedStays.filter((stay) => {
                      const client = clients.find(
                        (c) => c.id === stay.clientId
                      );
                      const room = rooms.find(
                        (r) => r.number === stay.roomNumber
                      );
                      return (
                        client?.name.toLowerCase().includes(searchLower) ||
                        stay.roomNumber.toLowerCase().includes(searchLower) ||
                        stay.id.toLowerCase().includes(searchLower) ||
                        room?.category.toLowerCase().includes(searchLower)
                      );
                    });
                  }

                  // Apply sorting
                  completedStays.sort((a, b) => {
                    const clientA = clients.find((c) => c.id === a.clientId);
                    const clientB = clients.find((c) => c.id === b.clientId);

                    switch (historySortOrder) {
                      case "date-desc":
                        return (
                          new Date(b.checkOutDate).getTime() -
                          new Date(a.checkOutDate).getTime()
                        );
                      case "date-asc":
                        return (
                          new Date(a.checkOutDate).getTime() -
                          new Date(b.checkOutDate).getTime()
                        );
                      case "name-asc":
                        return (clientA?.name || "").localeCompare(
                          clientB?.name || ""
                        );
                      case "name-desc":
                        return (clientB?.name || "").localeCompare(
                          clientA?.name || ""
                        );
                      default:
                        return 0;
                    }
                  });

                  return completedStays.length > 0 ? (
                    completedStays.map((stay) => {
                      const client = clients.find(
                        (c) => c.id === stay.clientId
                      );
                      const room = rooms.find(
                        (r) => r.number === stay.roomNumber
                      );
                      const extraCharges = (stay.charges || []).reduce(
                        (acc, curr) => acc + curr.amount,
                        0
                      );

                      return (
                        <tr
                          key={stay.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(stay.checkOutDate).toLocaleDateString(
                              "pt-BR"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-800">
                                {client?.name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {stay.id}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm font-bold text-gray-700">
                            #{stay.roomNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-bold ${
                                room?.category === "Presidente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : room?.category === "Luxo"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {room?.category || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>
                              <p>
                                {new Date(stay.checkInDate).toLocaleDateString(
                                  "pt-BR"
                                )}{" "}
                                -{" "}
                                {new Date(stay.checkOutDate).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                              <p className="text-xs text-gray-400">
                                {stay.totalDays} diária(s)
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-green-700">
                                R$ {stay.totalCost.toFixed(2)}
                              </p>
                              {extraCharges > 0 && (
                                <p className="text-xs text-orange-600">
                                  + R$ {extraCharges.toFixed(2)} extras
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                              <CheckCircle size={12} /> Finalizada
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {historySearchTerm
                          ? "Nenhuma estadia encontrada com os critérios de busca."
                          : "Nenhuma estadia finalizada ainda."}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Cadastrar Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  required
                  className="w-full p-2 border rounded-lg"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  required
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full p-2 border rounded-lg"
                  value={formData.document}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document: formatCPF(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    placeholder="00000000"
                    maxLength={8}
                    className="w-full p-2 border rounded-lg"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cep: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
                <div className="w-2/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    required
                    className="w-full p-2 border rounded-lg"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full p-2 border rounded-lg"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: formatPhone(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-hotel-600 text-white rounded-lg hover:bg-hotel-700"
                >
                  Salvar
                </button>
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
              <h2 className="text-2xl font-bold text-gray-800">
                Finalizar Estadia
              </h2>
              <p className="text-gray-500">Resumo da Conta</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 space-y-2">
              <div className="flex justify-between text-sm pb-2 border-b border-gray-200">
                <span className="text-gray-500">Cliente / Quarto:</span>
                <span className="font-bold">
                  {checkoutData.client.name} / #{checkoutData.stay.roomNumber}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-gray-500 flex items-center gap-1">
                  <BedDouble size={14} /> Diárias ({checkoutData.stay.totalDays}{" "}
                  dias):
                </span>
                <span className="font-medium">
                  R$ {checkoutData.roomRate.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Utensils size={14} /> Consumo (Restaurante):
                </span>
                <span className="font-medium text-orange-600">
                  R$ {checkoutData.totalExtras.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center mt-2">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span className="text-2xl font-bold text-gray-800">
                  R${" "}
                  {(checkoutData.roomRate + checkoutData.totalExtras).toFixed(
                    2
                  )}
                </span>
              </div>
            </div>

            {/* Loyalty Points Section */}
            {checkoutData.client.points > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-200 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="text-yellow-600" size={20} />
                  <h3 className="font-bold text-gray-800">
                    Usar Pontos de Fidelidade
                  </h3>
                </div>

                <div className="bg-white p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Pontos disponíveis:
                    </span>
                    <span className="font-bold text-yellow-700">
                      {checkoutData.client.points} pontos
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Conversão:</span>
                    <span>
                      {loyaltyConfig.pointsPerDiscount} pontos = 1% desconto
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Quantos pontos usar? ({pointsToUse} pontos)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={checkoutData.client.points}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Number(e.target.value))}
                      className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{checkoutData.client.points}</span>
                    </div>
                  </div>

                  {pointsToUse > 0 &&
                    (() => {
                      const discountPercentage =
                        pointsToUse / loyaltyConfig.pointsPerDiscount;
                      const subtotal =
                        checkoutData.roomRate + checkoutData.totalExtras;
                      const discount = (subtotal * discountPercentage) / 100;
                      const finalTotal = Math.max(0, subtotal - discount);

                      return (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-green-700 font-medium">
                              Desconto ({discountPercentage.toFixed(1)}%):
                            </span>
                            <span className="text-green-700 font-bold">
                              -R$ {discount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">
                              Novo total:
                            </span>
                            <span className="text-lg font-bold text-green-700">
                              R$ {finalTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            )}

            {/* Final Total */}
            <div className="bg-gray-800 text-white p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total a Pagar:</span>
                <span className="text-3xl font-bold">
                  R${" "}
                  {(() => {
                    const subtotal =
                      checkoutData.roomRate + checkoutData.totalExtras;
                    if (pointsToUse > 0) {
                      const discountPercentage =
                        pointsToUse / loyaltyConfig.pointsPerDiscount;
                      const discount = (subtotal * discountPercentage) / 100;
                      return Math.max(0, subtotal - discount).toFixed(2);
                    }
                    return subtotal.toFixed(2);
                  })()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handlePayment("Pix")}
                className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all font-medium"
              >
                <QrCode size={20} /> Pagamento via Pix
              </button>
              <button
                onClick={() => handlePayment("Cartão de Débito")}
                className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all font-medium"
              >
                <CreditCard size={20} /> Cartão de Débito
              </button>
              <button
                onClick={() => handlePayment("Cartão de Crédito")}
                className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 transition-all font-medium"
              >
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
                <p className="text-gray-500">
                  CPF: {selectedClient.document} • {selectedClient.phone}
                </p>
                <p className="text-gray-500 text-sm">
                  {selectedClient.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <p className="text-yellow-700 text-sm font-bold uppercase mb-1">
                  Programa de Fidelidade
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {selectedClient.points}{" "}
                  <span className="text-sm font-normal">pontos</span>
                </p>
                <div className="text-xs text-yellow-600 mt-2">
                  <p>Standard: 1 ponto/dia</p>
                  <p>Luxo: 2 pontos/dia</p>
                  <p>Presidente: 4 pontos/dia</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-blue-700 text-sm font-bold uppercase mb-1">
                  Total de Estadias
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {getClientStays(selectedClient.id).length}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <History size={20} /> Histórico de Estadias
            </h3>
            <div className="space-y-3">
              {getClientStays(selectedClient.id).map((stay) => (
                <div
                  key={stay.id}
                  className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <p className="font-bold">Quarto #{stay.roomNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(stay.checkInDate).toLocaleDateString()} -{" "}
                      {new Date(stay.checkOutDate).toLocaleDateString()}
                    </p>
                    {stay.charges && stay.charges.length > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        + R${" "}
                        {stay.charges
                          .reduce((a, c) => a + c.amount, 0)
                          .toFixed(2)}{" "}
                        em consumo
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">
                      R$ {stay.totalCost.toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        stay.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {stay.status === "active" ? "Ativa" : "Finalizada"}
                    </span>
                  </div>
                </div>
              ))}
              {getClientStays(selectedClient.id).length === 0 && (
                <p className="text-gray-500 italic">
                  Nenhuma estadia registrada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
