import React, { useState, useEffect } from 'react';
import { AppTab, PlantInfo, User, CompanyDetail } from './types';

// Layout Components
import Header from './components/layout/Header';
import NavBar from './components/layout/NavBar';
import LoadingOverlay from './components/layout/LoadingOverlay';

// Feature Components
import PlantDetail from './components/PlantDetail';
import Scanner from './components/scanner/Scanner';
import AuthForm from './components/auth/AuthForm';
import Dialog from './components/ui/Dialog';
import CompanyForm from './components/market/CompanyForm';
import CompanyDetailView from './components/market/CompanyDetailView';
import MarketDashboard from './components/market/MarketDashboard';
import AccountDashboard from './components/market/AccountDashboard';

import { supabase } from './supabaseClient';
import { databaseService } from './services/databaseService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  const [user, setUser] = useState<User | null>(null);
  const [collection, setCollection] = useState<PlantInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<CompanyDetail | null>(null);

  // Controle de Dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  const [myCompany, setMyCompany] = useState<CompanyDetail | null>(null);
  const [featuredCompanies, setFeaturedCompanies] = useState<CompanyDetail[]>([]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [pendingRegister, setPendingRegister] = useState(false);
  const [dialog, setDialog] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Carregar dados iniciais e monitorar autenticação
  useEffect(() => {
    // 1. Carregar Empresas em Destaque (Público)
    databaseService.getCompanies().then(setFeaturedCompanies).catch(console.error);

    // 2. Sincronizar Sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || ''
        };
        setUser(userData);
        loadUserData(userData.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || ''
        };
        setUser(userData);
        loadUserData(userData.id);
      } else {
        setUser(null);
        setCollection([]);
        setMyCompany(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [userCollection, userCompany] = await Promise.all([
        databaseService.getCollection(userId),
        databaseService.getMyCompany(userId)
      ]);
      setCollection(userCollection);
      setMyCompany(userCompany);
    } catch (err) {
      console.error("Erro ao carregar dados do usuário:", err);
    }
  };

  useEffect(() => {
    if (featuredCompanies.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredCompanies.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredCompanies.length]);

  const handlePlantIdentified = async (plant: PlantInfo) => {
    setLoading(true);
    try {
      if (user) {
        const savedPlant = await databaseService.savePlant(plant, user.id);
        setCollection(prev => [savedPlant, ...prev]);
        setSelectedPlant(savedPlant);
      } else {
        // Fallback temporário se não logado (opcional)
        setCollection(prev => [plant, ...prev]);
        setSelectedPlant(plant);
      }
    } catch (err: any) {
      alert("Erro ao salvar planta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (newUser: User) => {
    setUser(newUser);
    if (pendingRegister) {
      setActiveTab(AppTab.DISCOVER);
      setShowCompanyForm(true);
      setPendingRegister(false);
    } else {
      setActiveTab(AppTab.ACCOUNT);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCollection([]);
    setMyCompany(null);
    setActiveTab(AppTab.SCAN);
  };

  const handleRegisterCompany = async (company: CompanyDetail) => {
    if (!user) {
      alert("Você precisa estar logado para registrar uma empresa.");
      return;
    }
    setLoading(true);
    try {
      const savedCompany = await databaseService.saveCompany(company, user.id);
      setMyCompany(savedCompany);

      // Atualizar lista de destaques se necessário
      const updatedFeatured = await databaseService.getCompanies();
      setFeaturedCompanies(updatedFeatured);

      setShowCompanyForm(false);
      setActiveTab(AppTab.ACCOUNT);
      setActiveTab(AppTab.ACCOUNT);
      // alert("Empresa cadastrada com sucesso!");
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: 'Erro de Cadastro',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    setShowDashboard(false);
    setViewingCompany(null);
    setShowCompanyForm(false);
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setShowDashboard(false);
    setViewingCompany(null);
    setShowCompanyForm(false);
  };

  return (
    <div className="w-full sm:w-[clamp(360px,95vw,380px)] h-screen sm:h-[min(844px,calc(100vh-40px))] sm:my-4 flex flex-col relative overflow-hidden sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 shadow-2xl text-slate-800 transition-all duration-500 bg-[#f1f5f9]">
      <Header
        user={user}
        myCompany={myCompany}
        showDashboard={showDashboard}
        onLogoClick={handleLogoClick}
        onDashboardToggle={() => setShowDashboard(!showDashboard)}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto relative z-10">
        {showDashboard && myCompany ? (
          <MarketDashboard
            company={myCompany}
            onClose={() => setShowDashboard(false)}
            onEdit={() => { setShowDashboard(false); setShowCompanyForm(true); }}
          />
        ) : activeTab === AppTab.DISCOVER ? (
          <div className="p-0 flex flex-col animate-in fade-in">
            {showCompanyForm ? (
              <CompanyForm
                initialData={myCompany || undefined}
                onSubmit={handleRegisterCompany}
                onClose={() => setShowCompanyForm(false)}
              />
            ) : viewingCompany ? (
              <CompanyDetailView
                company={viewingCompany}
                onBack={() => setViewingCompany(null)}
              />
            ) : (
              <div className="space-y-8 pb-10">
                <div className="px-6 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destaques e Anúncios</p>
                    <button
                      onClick={() => {
                        if (!user) {
                          setPendingRegister(true);
                          setActiveTab(AppTab.AUTH);
                        } else {
                          setShowCompanyForm(true);
                        }
                      }}
                      className="text-[9px] font-black text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-all uppercase shadow-lg shadow-orange-100"
                    >
                      CADASTRO
                    </button>
                  </div>
                  <div className="relative overflow-hidden h-44 bg-white border border-slate-200 rounded-xl shadow-sm">
                    {featuredCompanies.map((emp, idx) => (
                      <div key={idx} className={`absolute inset-0 p-5 flex flex-col justify-between transition-all duration-700 ${idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50"><img src={emp.logo} className="w-full h-full object-cover" /></div>
                          <div>
                            <h4 className="font-bold text-[#1e293b] text-base">{emp.name}</h4>
                            <p className="text-[10px] text-slate-500">{emp.activity}</p>
                            <p className="text-[9px] text-slate-400 mt-1"><i className="fa-solid fa-location-dot mr-1 text-orange-500"></i> {emp.location}</p>
                          </div>
                        </div>
                        <div onClick={() => setViewingCompany(emp)} className="flex justify-between items-center cursor-pointer group">
                          <span className="text-[10px] font-black text-[#10b981] group-hover:text-orange-600 uppercase tracking-tighter">Ver Perfil Completo</span>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all"><i className="fa-solid fa-arrow-right text-[10px]"></i></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market info removed from here */}

                <div className="px-6 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Categorias</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Empresas', 'Produtos', 'Profissionais', 'Agro-negócio'].map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-orange-400 transition-all group active:scale-95">
                        <div className="w-10 h-10 bg-emerald-50 text-[#10b981] group-hover:bg-orange-500 group-hover:text-white rounded-lg flex items-center justify-center text-lg transition-all"><i className={`fa-solid ${cat === 'Empresas' ? 'fa-building' : cat === 'Produtos' ? 'fa-box' : cat === 'Profissionais' ? 'fa-user' : 'fa-hands-holding-circle'}`}></i></div>
                        <span className="font-bold text-slate-800 text-[11px] uppercase">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === AppTab.SCAN ? (
          <Scanner
            onPlantIdentified={handlePlantIdentified}
            onLoadingChange={setLoading}
          />
        ) : activeTab === AppTab.COLLECTION ? (
          <div className="h-full flex flex-col p-6 space-y-8 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#1e293b]">Mercado Agrário</h2>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Informações Essenciais Nacionais</p>
            </div>

            {/* Weather & Prices - Now here */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                <i className="fa-solid fa-cloud-sun absolute -right-2 -top-2 text-orange-50 text-5xl"></i>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Tempo Maputo</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-[#1e293b]">29°C</span>
                  <span className="text-[10px] text-slate-400 font-bold mb-1">Céu Limpo</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Cotação do Dia</p>
                <div className="space-y-1">
                  <div className="text-[11px] font-black text-emerald-600 flex justify-between">
                    <span>Milho</span>
                    <span>42 MT</span>
                  </div>
                  <div className="text-[11px] font-black text-slate-700 flex justify-between">
                    <span>Feijão</span>
                    <span>65 MT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Market News / Alerts */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alertas e Notícias</h3>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-700 uppercase">Época de Sementeira</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Início da campanha agrária 2026 em Gaza e Inhambane.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-wheat-awn"></i>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-700 uppercase">Escoamento de Produção</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Novas rotas de transporte facilitadas na Zambézia.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Info Card */}
            <div className="mt-auto bg-slate-900 p-6 rounded-[2.5rem] text-white relative overflow-hidden">
              <i className="fa-solid fa-leaf absolute -right-4 -bottom-4 text-white/5 text-7xl rotate-12"></i>
              <h4 className="text-sm font-black uppercase tracking-wider mb-2">Portal do Agricultor</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Acompanhe as tendências do mercado nacional em tempo real para tomar as melhores decisões no seu negócio.</p>
            </div>
          </div>
        ) : activeTab === AppTab.AUTH ? (
          <div className="h-full overflow-y-auto">
            <AuthForm onAuth={handleAuth} onNavigate={setActiveTab} />
          </div>
        ) : activeTab === AppTab.ACCOUNT ? (
          user ? (
            <AccountDashboard
              user={user}
              company={myCompany}
              onLogout={handleLogout}
              onEditCompany={() => {
                setActiveTab(AppTab.DISCOVER);
                setShowCompanyForm(true);
              }}
              onRegisterCompany={() => {
                setActiveTab(AppTab.DISCOVER);
                setShowCompanyForm(true);
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6 h-full">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-lock text-4xl text-slate-200"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1e293b]">Área Restrita</h2>
                <p className="text-xs text-slate-400 mt-2 px-6">Para aceder à sua conta e gerir os seus dados, por favor faça login.</p>
              </div>
              <button
                onClick={() => setActiveTab(AppTab.AUTH)}
                className="w-full max-w-[200px] bg-[#10b981] text-white py-3 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all"
              >
                Entrar | Registar
              </button>
            </div>
          )
        ) : null}
      </main>

      <NavBar activeTab={activeTab} onTabChange={handleTabChange} />

      {selectedPlant && (
        <PlantDetail
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onUpdateCustomName={async (id, name) => {
            try {
              await databaseService.updatePlant(id, { customName: name });
              setCollection(prev => prev.map(p => p.id === id ? { ...p, customName: name } : p));
              setSelectedPlant(null);
            } catch (err: any) {
              alert("Erro ao atualizar nome: " + err.message);
            }
          }}
          onAddRecipe={() => { }}
        />
      )}

      <LoadingOverlay isLoading={loading} />

      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  );
};

export default App;
