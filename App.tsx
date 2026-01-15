
import React, { useState, useEffect, useMemo } from 'react';
import { Customer, Transaction } from './types';
import { 
  Users, 
  Wallet, 
  PlusCircle, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  History,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDebtStrategy } from './services/geminiService';

// SUBSTITUA POR SUA URL DO RENDER APÓS O DEPLOY
const API_URL = 'https://seu-projeto-backend.onrender.com';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'history'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers`);
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const stats = useMemo(() => {
    const total = customers.reduce((acc, curr) => acc + Number(curr.totalDebt), 0);
    return {
      totalReceivable: total,
      activeCustomers: customers.length,
      highDebtCount: customers.filter(c => Number(c.totalDebt) > 5000).length
    };
  }, [customers]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCustomer = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      totalDebt: parseFloat(formData.get('debt') as string || '0'),
    };

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        await fetchCustomers();
        setIsAddingCustomer(false);
      }
    } catch (error) {
      alert("Erro ao salvar no banco de dados.");
    }
  };

  const fetchAiInsight = async (customer: Customer) => {
    setAiInsight(null);
    setLoadingAi(true);
    const insight = await getDebtStrategy(customer, []);
    setAiInsight(insight || "Erro ao carregar insights.");
    setLoadingAi(false);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">DebtManager</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="customers" icon={Users} label="Clientes" />
          <SidebarItem id="history" icon={History} label="Histórico" />
        </nav>
        <div className="mt-auto bg-slate-900 rounded-2xl p-4 text-white">
          <p className="text-xs text-slate-400 mb-1">Status API (Render)</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'} rounded-full`}></div>
            <span className="text-sm font-medium">Render Online</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar via API Render..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddingCustomer(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-md font-medium"
          >
            <PlusCircle size={18} /> Novo Cliente
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm">Total a Receber</p>
                    <h2 className="text-3xl font-bold text-slate-900">R$ {stats.totalReceivable.toLocaleString('pt-BR')}</h2>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm">Clientes Ativos</p>
                    <h2 className="text-3xl font-bold text-slate-900">{stats.activeCustomers}</h2>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm">Críticos</p>
                    <h2 className="text-3xl font-bold text-rose-600">{stats.highDebtCount}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold mb-6 text-lg">Distribuição de Dívidas</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={customers.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="totalDebt" radius={[6, 6, 0, 0]}>
                            {customers.map((c, i) => <Cell key={i} fill={Number(c.totalDebt) > 5000 ? '#f43f5e' : '#6366f1'} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <h3 className="font-bold text-lg mb-6">Últimos Registros Remotos</h3>
                    <div className="space-y-4">
                      {customers.slice(0, 5).map(customer => (
                        <div 
                          key={customer.id} 
                          onClick={() => { setSelectedCustomer(customer); fetchAiInsight(customer); }}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{customer.name}</p>
                              <p className="text-xs text-slate-500">{customer.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">R$ {Number(customer.totalDebt).toLocaleString('pt-BR')}</p>
                            <ChevronRight className="inline-block text-slate-300 group-hover:text-indigo-600" size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                     <th className="px-6 py-4 font-bold">Nome</th>
                     <th className="px-6 py-4 font-bold">Contato</th>
                     <th className="px-6 py-4 font-bold">Débito</th>
                     <th className="px-6 py-4 font-bold text-right">Ação</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredCustomers.map(customer => (
                     <tr key={customer.id} className="hover:bg-slate-50">
                       <td className="px-6 py-4 font-medium">{customer.name}</td>
                       <td className="px-6 py-4 text-sm text-slate-500">{customer.phone}</td>
                       <td className="px-6 py-4 font-bold text-rose-600">R$ {Number(customer.totalDebt).toLocaleString('pt-BR')}</td>
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => { setSelectedCustomer(customer); fetchAiInsight(customer); }}
                           className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                         >
                           <Info size={18} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Adicionar */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-6">Novo Registro Remoto</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <input name="name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Nome do Cliente" />
              <input name="email" type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Email" />
              <input name="phone" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Telefone" />
              <input name="debt" type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Valor da Dívida" />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingCustomer(false)} className="flex-1 py-3 text-slate-500">Voltar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200">Gravar no Render</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                <p className="text-slate-500">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400">Fechar</button>
            </div>
            
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 mb-6">
              <h3 className="font-bold text-indigo-700 flex items-center gap-2 mb-2">
                <TrendingUp size={18} /> Análise IA Gemini
              </h3>
              {loadingAi ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-indigo-200 rounded w-full"></div>
                  <div className="h-4 bg-indigo-200 rounded w-2/3"></div>
                </div>
              ) : (
                <p className="text-indigo-900 text-sm leading-relaxed">{aiInsight}</p>
              )}
            </div>

            <div className="flex gap-4">
               <button className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
                 <ArrowDownRight size={20} /> Receber Pagamento
               </button>
               <button className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl">
                 Ver Detalhes
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
