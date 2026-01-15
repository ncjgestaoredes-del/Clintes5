
import React, { useState, useEffect, useMemo } from 'react';
import { Customer } from './types';
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

// IMPORTANTE: Substitua pela URL que aparece no seu dashboard do Render.com
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
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erro ao buscar clientes:", error);
      setError("Não foi possível conectar à API no Render. Verifique se o backend está rodando.");
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
      } else {
        alert("Erro ao salvar: " + response.statusText);
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor Render.");
    }
  };

  const fetchAiInsight = async (customer: Customer) => {
    setAiInsight(null);
    setLoadingAi(true);
    const insight = await getDebtStrategy(customer, []);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">DebtManager</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'customers' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Users size={20} /> Clientes</button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><History size={20} /> Histórico</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar no Banco Render..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsAddingCustomer(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2">
            <PlusCircle size={18} /> Novo Cliente
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3">
              <Info size={20} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-slate-500 animate-pulse">Conectando ao Render.com...</p>
            </div>
          ) : (
            activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Total a Receber</p>
                    <h2 className="text-3xl font-bold text-slate-900">R$ {stats.totalReceivable.toLocaleString('pt-BR')}</h2>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Clientes Ativos</p>
                    <h2 className="text-3xl font-bold text-slate-900">{stats.activeCustomers}</h2>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Dívidas Críticas</p>
                    <h2 className="text-3xl font-bold text-rose-600">{stats.highDebtCount}</h2>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-lg mb-6">Gráfico de Inadimplência</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customers.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="totalDebt" radius={[4, 4, 0, 0]}>
                          {customers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Number(entry.totalDebt) > 5000 ? '#ef4444' : '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Registros Recentes</h3>
                  <div className="divide-y divide-slate-50">
                    {customers.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">Nenhum cliente encontrado no banco de dados.</p>
                    ) : (
                      customers.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center justify-between py-4 group cursor-pointer hover:bg-slate-50 px-4 rounded-2xl transition-all" onClick={() => { setSelectedCustomer(c); fetchAiInsight(c); }}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{c.name.charAt(0)}</div>
                            <div>
                              <p className="font-semibold text-slate-900">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-slate-900">R$ {Number(c.totalDebt).toLocaleString('pt-BR')}</p>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Dívida Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{c.email}</td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600">R$ {Number(c.totalDebt).toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => { setSelectedCustomer(c); fetchAiInsight(c); }} className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50">
                          <Info size={20} />
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

      {/* Modal Novo Cliente */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Novo Cliente</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">NOME COMPLETO</label>
                <input name="name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: João Silva" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">EMAIL</label>
                <input name="email" type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="joao@exemplo.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">TELEFONE</label>
                  <input name="phone" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">DÍVIDA INICIAL</label>
                  <input name="debt" type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingCustomer(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes/IA */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl shadow-indigo-100">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                  <p className="text-slate-500">{selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">Fechar</button>
            </div>

            <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={80} /></div>
              <h3 className="font-bold text-indigo-700 flex items-center gap-2 mb-4 text-lg">
                <TrendingUp size={20} /> Estratégia de Cobrança (IA Gemini)
              </h3>
              {loadingAi ? (
                <div className="space-y-3">
                  <div className="h-4 bg-indigo-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-indigo-200 rounded-full w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-indigo-200 rounded-full w-4/6 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-indigo-900 text-sm leading-relaxed whitespace-pre-line">
                  {aiInsight || "A IA está analisando o perfil de pagamento..."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="py-5 bg-emerald-600 text-white font-bold rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                <ArrowDownRight size={22} /> Baixar Dívida
              </button>
              <button className="py-5 bg-slate-900 text-white font-bold rounded-3xl hover:bg-slate-800 transition-all">
                Histórico Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
