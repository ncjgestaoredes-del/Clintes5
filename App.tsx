
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  PlusCircle, 
  Search, 
  ArrowDownRight, 
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  History,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDebtStrategy } from './services/geminiService';
import { Customer } from './types';

const API_URL = 'https://clientesresgistro.onrender.com'; 

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'history'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/customers`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro API:", err);
      setError("Erro ao conectar ao servidor Render.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const stats = useMemo(() => {
    const total = customers.reduce((acc, curr) => acc + Number(curr.totalDebt || 0), 0);
    return {
      totalReceivable: total,
      activeCustomers: customers.length,
      highDebtCount: customers.filter(c => Number(c.totalDebt) > 5000).length
    };
  }, [customers]);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Fix: Cast FormDataEntryValue to string to resolve the type error
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const debtStr = formData.get('debt') as string;

    const newCustomer = {
      id: crypto.randomUUID(),
      name: name,
      phone: phone,
      email: email,
      totalDebt: parseFloat(debtStr || '0'),
    };

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        fetchCustomers();
        setIsAddingCustomer(false);
      }
    } catch (err) {
      alert("Erro ao salvar.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">DebtManager</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'customers' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Users size={20} /> Clientes</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsAddingCustomer(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2">
            <PlusCircle size={18} /> Novo Cliente
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl">{error}</div>}
          
          {loading ? (
            <div className="flex items-center justify-center h-64">Carregando dados do Render...</div>
          ) : (
            activeTab === 'dashboard' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <p className="text-slate-500 text-sm">Total a Receber</p>
                    <h2 className="text-3xl font-bold">R$ {stats.totalReceivable.toLocaleString('pt-BR')}</h2>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <p className="text-slate-500 text-sm">Clientes Ativos</p>
                    <h2 className="text-3xl font-bold">{stats.activeCustomers}</h2>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h3 className="font-bold mb-4">Lista de Devedores</h3>
                  <div className="space-y-2">
                    {customers.map(c => (
                      <div key={c.id} className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                        <span>{c.name}</span>
                        <span className="font-bold text-rose-600">R$ {Number(c.totalDebt).toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border shadow-sm">
                <h2 className="text-xl font-bold mb-4">Todos os Clientes</h2>
                {/* Tabela ou Lista aqui */}
                {filteredCustomers.map(c => (
                  <div key={c.id} className="border-b py-2">{c.name} - {c.email}</div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Modal Novo Cliente */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Adicionar Cliente</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <input name="name" placeholder="Nome" required className="w-full p-3 bg-slate-100 rounded-xl" />
              <input name="email" type="email" placeholder="Email" required className="w-full p-3 bg-slate-100 rounded-xl" />
              <input name="phone" placeholder="Telefone" className="w-full p-3 bg-slate-100 rounded-xl" />
              <input name="debt" type="number" placeholder="Dívida" className="w-full p-3 bg-slate-100 rounded-xl" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAddingCustomer(false)} className="flex-1 p-3">Cancelar</button>
                <button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
