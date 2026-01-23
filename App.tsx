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
import VideoAdForm from './components/market/VideoAdForm';

import { supabase } from './supabaseClient';
import { databaseService } from './services/databaseService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  const [user, setUser] = useState<User | null>(null);
  const [collection, setCollection] = useState<PlantInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Playlist de Vídeos Publicitários (30 Segundos em Loop)
  const [adVideos, setAdVideos] = useState<string[]>([
    'https://www.youtube.com/embed/dFkpQz2Zw0c',
    'https://www.youtube.com/embed/Y4goaZhNt4k',
    'https://www.youtube.com/embed/df1RYxkASyw'
  ]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showVideoAdForm, setShowVideoAdForm] = useState(false);
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

    // 2. Carregar Spots de Vídeo
    databaseService.getVideoAds()
      .then(ads => {
        if (ads.length > 0) {
          const dbEmbeds = ads.map(ad => ad.embedUrl);
          // Manter os exemplos e adicionar os do banco no início ou fim
          setAdVideos(prev => [...prev, ...dbEmbeds]);
        }
      })
      .catch(console.error);

    // 3. Sincronizar Sessão
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

  // Efeito para trocar vídeos da playlist automaticamente
  useEffect(() => {
    if (adVideos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentVideoIndex(prev => (prev + 1) % adVideos.length);
    }, 30000); // Troca a cada 30 segundos

    return () => clearInterval(interval);
  }, [adVideos]);

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
      setDialog({
        isOpen: true,
        title: 'Acesso Negado',
        message: 'Você precisa estar logado para registrar uma empresa.',
        type: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      const savedCompany = await databaseService.saveCompany(company, user.id);
      setMyCompany(savedCompany);

      // Atualizar lista de destaques se necessário
      const allCompanies = await databaseService.getCompanies();
      const featuredOnly = allCompanies.filter(c => c.isFeatured);
      setFeaturedCompanies(featuredOnly);

      setShowCompanyForm(false);
      setActiveTab(AppTab.ACCOUNT);

      setDialog({
        isOpen: true,
        title: 'Sucesso',
        message: 'Empresa cadastrada com sucesso!',
        type: 'success'
      });
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
                onAlert={(title, message, type) => setDialog({ isOpen: true, title, message, type })}
              />
            ) : viewingCompany ? (
              <CompanyDetailView
                company={viewingCompany}
                onBack={() => setViewingCompany(null)}
              />
            ) : (
              <div className="flex flex-col animate-in fade-in pb-10">
                {/* Hero Slider (Architecture Mirror of Market) */}
                <div className="aspect-video bg-white border-b border-slate-200 shadow-sm overflow-hidden relative group">
                  {featuredCompanies.length > 0 ? (
                    featuredCompanies.map((emp, idx) => (
                      <div key={idx} className={`absolute inset-0 p-6 flex flex-col justify-between transition-all duration-700 ${idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                        {/* Premium Badge top-right */}
                        <div className="absolute top-6 right-6">
                          <span className="px-2 py-1 bg-emerald-500 text-[9px] font-black text-white rounded uppercase tracking-widest shadow-sm">Premium</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="h-12 w-full flex items-center justify-start">
                            <img src={emp.logo} className="h-full max-w-[150px] object-contain" />
                          </div>
                          <div>
                            <div className="mb-1">
                              <h4 className="font-black text-slate-700 text-lg leading-none">{emp.name}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 font-bold tracking-tight">{emp.activity}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center">
                              <i className="fa-solid fa-location-dot mr-2 text-orange-500"></i> {emp.location}
                            </p>

                            {/* Ver Perfil Text Link */}
                            <div
                              onClick={(e) => { e.stopPropagation(); setViewingCompany(emp); }}
                              className="inline-flex items-center gap-2 mt-4 cursor-pointer group/link hover:opacity-80 transition-all"
                            >
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter border-b border-emerald-600/30 group-hover/link:border-emerald-600 transition-all">Ver Perfil da Empresa</span>
                              <i className="fa-solid fa-arrow-right text-[9px] text-emerald-600 transition-transform group-hover/link:translate-x-1"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                        <i className="fa-solid fa-store text-slate-200 text-3xl"></i>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nenhuma empresa em destaque</p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase mt-1">Seja o primeiro a aparecer aqui</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Registration Banner (Architectural Mirror) */}
                <div
                  onClick={() => {
                    if (!user) {
                      setPendingRegister(true);
                      setActiveTab(AppTab.AUTH);
                    } else {
                      setShowCompanyForm(true);
                    }
                  }}
                  className="bg-[#10b981] px-6 py-[10px] flex items-center justify-between cursor-pointer border-y border-emerald-500 hover:bg-[#f97316] transition-all group shadow-lg shadow-emerald-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-white/20 backdrop-blur-md border border-white/30 rounded flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <i className="fa-solid fa-building text-white text-sm"></i>
                    </div>
                    <div className="leading-none pt-1">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-none">Cadastre sua Empresa</h4>
                      <p className="text-[10px] text-emerald-50 group-hover:text-orange-50 font-medium mt-1">Aumente sua visibilidade no mercado agrário.</p>
                    </div>
                  </div>
                </div>

                {/* Discover Categories (Mirror Spacing) */}
                <div className="px-6 space-y-3 mt-3 pb-3">
                  <div className="grid grid-cols-2 gap-3">
                    {['Empresas', 'Produtos', 'Profissionais', 'Agro-negócio'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-orange-400 transition-all hover:shadow-lg hover:shadow-slate-100 group active:scale-95"
                      >
                        <div className="w-10 h-10 bg-emerald-50 text-[#10b981] group-hover:bg-orange-500 group-hover:text-white rounded-lg flex items-center justify-center text-lg transition-all shadow-sm">
                          <i className={`fa-solid ${cat === 'Empresas' ? 'fa-building' : cat === 'Produtos' ? 'fa-box' : cat === 'Profissionais' ? 'fa-user' : 'fa-hands-holding-circle'}`}></i>
                        </div>
                        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-tight">{cat}</span>
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
          <div className="h-full flex flex-col animate-in fade-in">
            {/* Market Video Section (Ad Spot) */}
            <div className="">
              <div className="aspect-video bg-white border-b border-slate-200 shadow-sm overflow-hidden flex flex-col relative group">
                <iframe
                  className="w-full h-full"
                  src={`${adVideos[currentVideoIndex]}?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1&playlist=${adVideos[currentVideoIndex].split('/').pop()}&start=0&end=30`}
                  title="Publicidade em Vídeo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="absolute inset-0 bg-slate-900/10 pointer-events-none group-hover:bg-transparent transition-all"></div>
              </div>
              <div
                onClick={() => setShowVideoAdForm(true)}
                className="bg-[#10b981] px-6 py-[10px] flex items-center justify-between cursor-pointer border-y border-emerald-500 hover:bg-[#f97316] transition-all group shadow-lg shadow-emerald-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-white/20 backdrop-blur-md border border-white/30 rounded flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <i className="fa-brands fa-youtube text-white text-base"></i>
                  </div>
                  <div className="leading-none pt-1">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-none">Publicidade em Vídeo</h4>
                    <p className="text-[10px] text-emerald-50 group-hover:text-orange-50 font-medium mt-1">Anuncie seu agro-negócio aqui.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Categories (New) */}
            <div className="px-6 mt-3 pb-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Fornecedores', icon: 'fa-handshake' },
                  { label: 'Produtores', icon: 'fa-seedling' },
                  { label: 'Consumidores', icon: 'fa-user-tag' },
                  { label: 'Profissionais', icon: 'fa-user-tie' },
                  { label: 'Lojas de Insumos', icon: 'fa-shop' },
                  { label: 'Maquinaria', icon: 'fa-tractor' }
                ].map(cat => (
                  <button key={cat.label} onClick={() => setActiveCategory(cat.label)} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-orange-400 transition-all group active:scale-95 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 text-[#10b981] group-hover:bg-orange-500 group-hover:text-white rounded-lg flex items-center justify-center text-lg transition-all">
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <span className="font-bold text-slate-800 text-[10px] uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === AppTab.AUTH ? (
          <div className="h-full overflow-y-auto">
            <AuthForm
              onAuth={handleAuth}
              onNavigate={setActiveTab}
              onAlert={(title, message, type) => setDialog({ isOpen: true, title, message, type })}
            />
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

      {showVideoAdForm && (
        <VideoAdForm
          onClose={() => setShowVideoAdForm(false)}
          onSubmit={(data) => {
            // Extrair ID do vídeo do link do YouTube
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = data.videoLink.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : data.videoLink;

            const embedUrl = videoId.includes('http') ?
              (videoId.includes('embed') ? videoId : `https://www.youtube.com/embed/${videoId}`) :
              `https://www.youtube.com/embed/${videoId}`;

            // Persistir no Banco de Dados
            databaseService.saveVideoAd({
              companyName: data.companyName,
              phone: data.phone,
              address: data.address,
              videoLink: data.videoLink,
              embedUrl: embedUrl
            }).then(() => {
              // Adicionar à playlist local APÓS o pagamento e persistência
              setAdVideos(prev => [...prev, embedUrl]);
              setCurrentVideoIndex(adVideos.length); // Pula para o novo vídeo

              setDialog({
                isOpen: true,
                title: 'Publicidade Ativada',
                message: `O vídeo da "${data.companyName}" foi pago e adicionado à playlist com sucesso!`,
                type: 'success'
              });
            }).catch(err => {
              console.error("Erro ao salvar vídeo:", err);
              setDialog({
                isOpen: true,
                title: 'Erro no Cadastro',
                message: 'Houve um erro ao salvar seu vídeo. Por favor, entre em contacto.',
                type: 'error'
              });
            });

            setShowVideoAdForm(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
