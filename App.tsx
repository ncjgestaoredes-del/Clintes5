
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, Search, Edit3, LayoutDashboard, 
  X, Phone, Mail, DollarSign, Wallet, TrendingUp 
} from 'lucide-react';

const API_BASE = '/api/customers'; // Caminho para Serverless Functions na Vercel

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Estados do formulário
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', totalDebt: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const stats = useMemo(() => {
    const total = customers.reduce((acc, c) => acc + Number(c.totalDebt || 0), 0);
    return { total, count: customers.length };
  }, [customers]);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (customer = null) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({ 
        name: customer.name, 
        email: customer.email, 
        phone: customer.phone, 
        totalDebt: customer.totalDebt 
      });
    } else {
      setSelectedCustomer(null);
      setFormData({ name: '', email: '', phone: '', totalDebt: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = selectedCustomer ? 'PUT' : 'POST';
    const body = selectedCustomer 
      ? { ...formData, id: selectedCustomer.id } 
      : { ...formData, id: crypto.randomUUID() };

    try {
      const res = await fetch(API_BASE, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      alert("Falha na operação.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="w-72 bg-slate-900 text-white p-8 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg"><Wallet size={24}/></div>
          <span className="text-xl font-bold tracking-tight">DebtManager</span>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <button 
            onClick={() => setView('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'customers' ? 'bg-indigo-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={20}/> Clientes
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              {view === 'dashboard' ? 'Visão Geral' : 'Lista de Clientes'}
            </h1>
            <p className="text-slate-500 mt-1">Bem-vindo ao seu controle financeiro.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform active:scale-95 shadow-xl shadow-indigo-100"
          >
            <Plus size={20}/> Novo Cliente
          </button>
        </header>

        {view === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="bg-rose-50 text-rose-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <DollarSign size={24}/>
              </div>
              <p className="text-slate-400 font-semibold uppercase text-xs tracking-widest">Total a Receber</p>
              <h2 className="text-4xl font-black text-slate-800 mt-2">
                R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24}/>
              </div>
              <p className="text-slate-400 font-semibold uppercase text-xs tracking-widest">Clientes Ativos</p>
              <h2 className="text-4xl font-black text-slate-800 mt-2">{stats.count}</h2>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
              <input 
                placeholder="Pesquisar por nome..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              {filtered.map(c => (
                <div key={c.id} className="group flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-xl uppercase">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{c.name}</h4>
                      <div className="flex gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400"><Mail size={12}/> {c.email}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-400"><Phone size={12}/> {c.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Dívida Total</p>
                      <p className="text-xl font-black text-rose-600">R$ {Number(c.totalDebt).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <button 
                      onClick={() => openModal(c)}
                      className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit3 size={20}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
            ><X size={24}/></button>
            
            <h2 className="text-2xl font-extrabold text-slate-800 mb-8">
              {selectedCustomer ? 'Editar Registro' : 'Novo Cadastro'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telefone</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dívida (R$)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all font-bold text-rose-600"
                    value={formData.totalDebt}
                    onChange={e => setFormData({...formData, totalDebt: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">E-mail</label>
                <input 
                  type="email"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all mt-4"
              >
                {selectedCustomer ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
