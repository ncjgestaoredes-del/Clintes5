
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, Search, Edit3, LayoutDashboard, 
  X, Phone, Mail, DollarSign, Wallet, ArrowRight, Menu
} from 'lucide-react';

const API_BASE = '/api/customers';

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', totalDebt: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro API:", err);
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
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const url = selectedCustomer ? `${API_BASE}/${selectedCustomer.id}` : API_BASE;
    const payload = selectedCustomer ? { ...formData } : { ...formData, id: crypto.randomUUID() };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      alert("Erro ao salvar dados.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
      
      {/* NAVEGAÇÃO LATERAL (DESKTOP & TABLET) */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-slate-900 text-white flex-col sticky top-0 h-screen transition-all duration-300 overflow-hidden">
        <div className="p-6 mb-4 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-xl shrink-0">
            <Wallet size={24} />
          </div>
          <span className="text-xl font-bold hidden lg:block tracking-tight">DebtPro</span>
        </div>
        
        <nav className="flex-1 px-3 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-indigo-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden lg:block font-medium text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('customers')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'customers' ? 'bg-indigo-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={20} />
            <span className="hidden lg:block font-medium text-sm">Clientes</span>
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full">
        
        {/* CABEÇALHO ADAPTATIVO */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="md:hidden bg-indigo-600 p-1.5 rounded-lg text-white">
              <Wallet size={20} />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-800 truncate">
              {view === 'dashboard' ? 'Overview' : 'Diretório'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:block relative w-48 lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  placeholder="Pesquisar..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => openModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-indigo-100 text-xs sm:text-sm"
              >
                <Plus size={18}/> <span className="hidden xs:block">Novo Cliente</span>
              </button>
          </div>
        </header>

        {/* ÁREA DE SCROLL */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto w-full max-w-screen-2xl mx-auto">
          {view === 'dashboard' ? (
            <div className="space-y-6 sm:space-y-8 animate-slide-up">
              
              {/* GRID DE STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-indigo-600 p-6 sm:p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
                  <p className="text-indigo-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-80">Saldo Total</p>
                  <h2 className="text-3xl sm:text-4xl font-black mt-2">
                    R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Base de Clientes</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mt-2">{stats.count}</h2>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl text-indigo-600">
                    <Users size={32} />
                  </div>
                </div>
              </div>

              {/* LISTA RECENTE ADAPTATIVA */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-slate-800">Devedores Críticos</h3>
                   <button onClick={() => setView('customers')} className="text-xs font-bold text-indigo-600 hover:underline">Ver Tabela Completa</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customers.slice(0, 4).map(c => (
                    <div key={c.id} onClick={() => openModal(c)} className="group flex items-center justify-between p-4 sm:p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[150px]">{c.name}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{c.phone}</p>
                        </div>
                      </div>
                      <p className="font-black text-rose-600 text-sm sm:text-lg">R$ {Number(c.totalDebt).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-up">
              {/* BUSCA MOBILE */}
              <div className="sm:hidden relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  placeholder="Buscar cliente..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* LISTA DE CLIENTES ADAPTATIVA (CARD NO MOBILE, ROW NO PC) */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filtered.map(c => (
                  <div key={c.id} onClick={() => openModal(c)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-xl transition-all cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                           {c.name.charAt(0)}
                         </div>
                         <div>
                            <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{c.name}</h4>
                            <span className="text-xs text-slate-400 flex items-center gap-1"><Mail size={12}/> {c.email}</span>
                         </div>
                      </div>
                      <Edit3 size={16} className="text-slate-300 group-hover:text-indigo-600" />
                    </div>
                    
                    <div className="h-px bg-slate-50 w-full" />
                    
                    <div className="flex items-end justify-between">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contato</p>
                          <p className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Phone size={14}/> {c.phone}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Devedor</p>
                          <p className="text-2xl font-black text-rose-600 tracking-tight">R$ {Number(c.totalDebt).toFixed(2)}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO INFERIOR (MOBILE APENAS) */}
        <nav className="md:hidden bg-white border-t border-slate-100 px-6 py-3 flex justify-around items-center safe-bottom shadow-2xl">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </button>
          <button 
            onClick={() => setView('customers')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'customers' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
          >
            <Users size={24} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Clientes</span>
          </button>
        </nav>
      </main>

      {/* MODAL ADAPTATIVO (CENTRAL NO PC, BOTTOM SHEET NO MOBILE) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 z-50">
          <div className="bg-white w-full max-w-xl md:rounded-[3rem] rounded-t-[3rem] p-8 sm:p-12 shadow-2xl animate-slide-up relative overflow-hidden">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:hidden"></div>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {selectedCustomer ? 'Editar Perfil' : 'Novo Cliente'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">Preencha os dados financeiros abaixo.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone Celular</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dívida Atual (R$)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-rose-500 focus:bg-white outline-none transition-all font-black text-rose-600 text-lg"
                    value={formData.totalDebt}
                    onChange={e => setFormData({...formData, totalDebt: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Principal</label>
                <input 
                  type="email"
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[1.5rem] shadow-xl shadow-indigo-100 active:scale-95 transition-all text-base mt-4"
              >
                {selectedCustomer ? 'Atualizar Registro' : 'Salvar Cadastro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
