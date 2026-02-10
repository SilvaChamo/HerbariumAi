import React, { useState, useEffect, useRef, useCallback } from 'react';

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
import ProfessionalForm from './components/market/ProfessionalForm';
import CompanyDetailView from './components/market/CompanyDetailView';
import MarketDashboard from './components/market/MarketDashboard';
import AccountDashboard from './components/market/AccountDashboard';
import VideoAdForm from './components/market/VideoAdForm';
import VideoManagement from './components/market/VideoManagement';
import ProductDetailView from './components/market/ProductDetailView';
import ProfessionalDetailView from './components/market/ProfessionalDetailView';
import { SkeletonCard, SkeletonHeader } from './components/ui/SkeletonLoader';
import NewsDetailView from './components/market/NewsDetailView';
import SearchEngine from './components/ui/SearchEngine';
import { CompanyDetail, PlantInfo, User, Professional, MarketProduct, AppTab } from './types';
import { supabase } from './supabaseClient';
import { databaseService } from './services/databaseService';

const ADMIN_EMAILS = ['silva.chamo@gmail.com', 'silvachamo@gmail.com', 'admin@botanica.co.mz', 'silva@agrodata.co.mz', 'chamo@agrodata.co.mz'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [user, setUser] = useState<User | null>(null);
  const [collection, setCollection] = useState<PlantInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);

  // Playlist de Vídeos Publicitários (30 Segundos em Loop)
  const [adVideos, setAdVideos] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showProfessionalForm, setShowProfessionalForm] = useState(false);
  const [showVideoAdForm, setShowVideoAdForm] = useState(false);
  const [showVideoManagement, setShowVideoManagement] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<CompanyDetail | null>(null);
  const [viewingProduct, setViewingProduct] = useState<MarketProduct | null>(null);
  const [viewingProfessional, setViewingProfessional] = useState<Professional | null>(null);
  const [viewingNews, setViewingNews] = useState<any | null>(null);

  // Controle de Dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  const [myCompany, setMyCompany] = useState<CompanyDetail | null>(null);
  const [featuredCompanies, setFeaturedCompanies] = useState<CompanyDetail[]>([]);
  const [recentProducts, setRecentProducts] = useState<MarketProduct[]>([]);
  const [featuredProfessionals, setFeaturedProfessionals] = useState<Professional[]>([]);
  const [appStats, setAppStats] = useState({ companies: 0, products: 0, professionals: 0 });
  const [isDbOnline, setIsDbOnline] = useState(true);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showAccountCollections, setShowAccountCollections] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [pendingRegister, setPendingRegister] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null); // State for PWA install prompt

  const [dialog, setDialog] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Carregar dados iniciais e monitorar autenticação
  useEffect(() => {
    databaseService.getCompanies().then(setFeaturedCompanies).catch(console.error);

    // 1.1 Carregar Produtos Recentes
    databaseService.getProducts().then(prods => setRecentProducts(prods.slice(0, 6))).catch(console.error);

    // 1.2 Carregar Profissionais em Destaque
    databaseService.getProfessionals().then(profs => setFeaturedProfessionals(profs.slice(0, 6))).catch(console.error);

    // 2. Carregar Spots de Vídeo
    databaseService.getVideoAds()
      .then(ads => {
        if (ads.length > 0) {
          const dbEmbeds = ads.map(ad => ad.embedUrl);
          setAdVideos(dbEmbeds);
        } else {
          // Playlist padrão se estiver vazio (Livestock/Pecuária)
          setAdVideos([
            'https://www.youtube.com/embed/hcrHxPRDAvc',
            'https://www.youtube.com/embed/pJwhw100QTc',
            'https://www.youtube.com/embed/D-jU2-Dk_hU'
          ]);
        }
      })
      .catch(console.error);

    // 3. Sincronizar Sessão Inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || 'Usuário',
          avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
          isAdmin: ADMIN_EMAILS.includes(session.user.email || '')
        };
        setUser(userData);
        loadUserData(userData.id);
      }
    });

    // 4. Ouvinte de Mudança de Autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || 'Usuário',
          avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
          isAdmin: ADMIN_EMAILS.includes(session.user.email || '')
        };
        // Só actualiza se os dados mudarem efectivamente
        setUser(prev => prev?.id === userData.id ? prev : userData);
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setCollection([]);
        setMyCompany(null);
      }
    });

    // 4. Carregar Estatísticas e Verificar Conexão
    databaseService.getAppStats().then(setAppStats).catch(console.error);
    databaseService.checkConnection().then(setIsDbOnline).catch(() => setIsDbOnline(false));

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Sem dependências para evitar loops infinitos

  // Efeito para aplicar o tema no body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Efeito para calcular a altura real do viewport no mobile (evita problemas com a barra de endereços)
  useEffect(() => {
    const calcVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    calcVH();
    window.addEventListener('resize', calcVH);
    return () => window.removeEventListener('resize', calcVH);
  }, []);

  // Efeito isolado para o atalho de registo via evento customizado e instalação PWA
  useEffect(() => {
    const handleOpenForm = () => {
      setActiveTab(AppTab.DISCOVER);
      if (!user) {
        setPendingRegister(true);
        setActiveTab(AppTab.AUTH);
      } else {
        setShowCompanyForm(true);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('open-company-form', handleOpenForm);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('open-company-form', handleOpenForm);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [user]);

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
    const userWithAdmin = { ...newUser, isAdmin: ADMIN_EMAILS.some(e => e.toLowerCase() === (newUser.email || '').toLowerCase()) };
    setUser(userWithAdmin);
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

  const handleCategoryClick = async (category: string) => {
    setLoading(true);
    setActiveCategory(category);
    try {
      if (category === 'Alertas') {
        const results = [
          { id: 'sms-alerts', name: 'Ativação de Alertas SMS', activity: 'Serviço de Mensagens', searchType: 'Alertas', icon: 'fa-comment-sms' },
          { id: 'inbox-alerts', name: 'Inbox de SMS', activity: 'Histórico de Alertas', searchType: 'Alertas', icon: 'fa-inbox' },
          { id: 'settings-alerts', name: 'Configurações de Alertas', activity: 'Personalização', searchType: 'Alertas', icon: 'fa-gears' }
        ];
        setFilteredResults(results);
      } else if (category === 'Dicas & Notícias' || category === 'Notícias') {
        const results = await databaseService.getNews();
        setFilteredResults(results);
      } else if (category === 'Empresas' || category === 'Lojas de Insumos') {
        const results = await databaseService.getCompanies();
        setFilteredResults(results);
      } else if (category === 'Profissionais') {
        const results = await databaseService.getProfessionals();
        setFilteredResults(results);
      } else if (category === 'Produtos') {
        const results = await databaseService.getProducts();
        setFilteredResults(results);
      } else {
        const results = await databaseService.getCompaniesByCategory(category);
        setFilteredResults(results);
      }
    } catch (err) {
      console.error("Erro ao carregar categoria:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = useCallback(async (query: string) => {
    setLoading(true);
    setActiveCategory(`Busca: "${query}"`);
    try {
      const results = await databaseService.globalSearch(query);
      setFilteredResults(results);
    } catch (err) {
      console.error("Erro na busca global:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdminAction = async (e: React.MouseEvent, action: 'edit' | 'archive' | 'delete', item: any) => {
    e.stopPropagation();
    const type = item.company_id || item.searchType === 'Produto' ? 'product' :
      (item.category === 'Profissional' || item.searchType === 'Profissional' ? 'professional' : 'company');

    if (action === 'delete') {
      if (!window.confirm(`Tem certeza que deseja ELIMINAR permanentemente: ${item.name}?`)) return;
      setLoading(true);
      try {
        if (type === 'company') {
          await databaseService.deleteCompany(item.id);
          setFeaturedCompanies(prev => prev.filter(i => i.id !== item.id));
          if (myCompany?.id === item.id) setMyCompany(null);
        } else if (type === 'professional') {
          await databaseService.deleteProfessional(item.id);
          setFeaturedProfessionals(prev => prev.filter(i => i.id !== item.id));
        } else {
          await databaseService.deleteProduct(item.id);
          setRecentProducts(prev => prev.filter(i => i.id !== item.id));
        }

        setFilteredResults(prev => prev.filter(i => i.id !== item.id));
        setDialog({ isOpen: true, title: 'Eliminado', message: `${item.name} foi removido com sucesso.`, type: 'success' });
      } catch (err: any) {
        alert("Erro ao eliminar: " + err.message);
      } finally {
        setLoading(false);
      }
    } else if (action === 'archive') {
      const newStatus = !item.is_archived;
      setLoading(true);
      try {
        if (type === 'company') {
          await databaseService.archiveCompany(item.id, newStatus);
          setFeaturedCompanies(prev => prev.filter(i => i.id !== item.id));
        } else if (type === 'professional') {
          await databaseService.archiveProfessional(item.id, newStatus);
          setFeaturedProfessionals(prev => prev.filter(i => i.id !== item.id));
        } else {
          await databaseService.archiveProduct(item.id, newStatus);
          setRecentProducts(prev => prev.filter(i => i.id !== item.id));
        }

        setFilteredResults(prev => prev.filter(i => i.id !== item.id));
      } catch (err: any) {
        alert("Erro ao arquivar: " + err.message);
      } finally {
        setLoading(false);
      }
    } else if (action === 'edit') {
      if (type === 'company') {
        setViewingCompany(item);
      } else if (type === 'professional') {
        setViewingProfessional(item);
      } else {
        setViewingProduct(item);
      }
    }
  };

  const handleLogoClick = useCallback(() => {
    setShowDashboard(false);
    setViewingCompany(null);
    setShowCompanyForm(false);
    setActiveCategory(null);
    setFilteredResults([]);
  }, []);

  const handleTabChange = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    setShowDashboard(tab === AppTab.ACCOUNT ? false : showDashboard);
    setShowAccountCollections(false); // Reset when tab changes
    setViewingCompany(null);
    setShowCompanyForm(false);
  }, [showDashboard]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback para dispositivos não suportados (iOS, etc.)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

      setDialog({
        isOpen: true,
        title: 'Como Instalar',
        message: isIOS
          ? 'Para instalar no iPhone/iPad:\n1. Toque no botão de Partilha (quadrado com seta)\n2. Escolha "Adicionar ao Ecrã Principal"'
          : 'Para instalar neste dispositivo:\nProcure a opção "Instalar Aplicativo" ou "Adicionar ao Ecrã Principal" no menu do seu navegador.',
        type: 'info'
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleShowAbout = () => {
    setDialog({
      isOpen: true,
      title: 'Sobre a Botânica',
      message: 'A plataforma Botânica v2.0 é o ecossistema digital líder para o agronegócio em Moçambique, conectando produtores, fornecedores e especialistas em uma única rede integrada.',
      type: 'info'
    });
  };

  const handleShowPrivacy = () => {
    setDialog({
      isOpen: true,
      title: 'Termos & Privacidade',
      message: 'Os seus dados são protegidos por criptografia de ponta a ponta. Não partilhamos as suas informações comerciais com terceiros sem o seu consentimento explícito.',
      type: 'info'
    });
  };

  const handleHelp = () => {
    setDialog({
      isOpen: true,
      title: 'Centro de Ajuda',
      message: 'Precisa de ajuda? Entre em contacto com o nosso suporte via WhatsApp: +258 84 000 0000 ou email: suporte@agrodata.co.mz',
      type: 'info'
    });
  };

  return (
    <div
      className={`w-full sm:w-[500px] flex flex-col relative overflow-hidden text-slate-800 dark:text-slate-100 transition-all duration-500 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <Header
        user={user}
        myCompany={myCompany}
        showDashboard={showDashboard}
        onLogoClick={handleLogoClick}
        onDashboardToggle={() => setShowDashboard(s => !s)}
        onLogout={handleLogout}
        onSearch={handleGlobalSearch}
        installPrompt={deferredPrompt}
        onInstall={handleInstallClick}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        appStats={appStats}
        isDbOnline={isDbOnline}
        onAbout={handleShowAbout}
        onPrivacy={handleShowPrivacy}
        onHelp={handleHelp}
        onCategoryFilter={handleCategoryClick}
        onSearchToggle={() => setIsSearchVisible(true)}
        onNavigate={(tab) => {
          if (tab === 'collection') {
            setActiveTab(AppTab.ACCOUNT);
            setShowAccountCollections(true);
          } else {
            handleTabChange(tab as AppTab);
          }
        }}
      />

      <SearchEngine
        isVisible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSearch={handleGlobalSearch}
        onCategoryFilter={handleCategoryClick}
      />

      <main className="flex-1 overflow-y-auto relative z-10">
        {showDashboard && myCompany ? (
          <MarketDashboard
            company={myCompany}
            onClose={() => setShowDashboard(false)}
            onEdit={() => { setShowDashboard(false); setShowCompanyForm(true); }}
          />
        ) : activeCategory && filteredResults ? (
          <div className="flex flex-col animate-in fade-in pb-10">
            {/* Category Header */}
            {loading ? (
              <SkeletonHeader />
            ) : (
              <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setActiveCategory(null); setFilteredResults([]); }}
                    className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-600 transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                  </button>
                  <div className="leading-none">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Mercado</h3>
                    <h2 className="text-lg font-black text-slate-700 dark:text-slate-100 leading-none">{activeCategory}</h2>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500">{filteredResults.length} Encontrados</span>
                </div>
              </div>
            )}

            {/* Featured Section inside Category */}
            {!loading && activeCategory === 'Produtos' && recentProducts.length > 0 && (
              <div className="px-6 space-y-4 py-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-widest">Produtos Recentes</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                  {recentProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => setViewingProduct(prod)}
                      className="w-32 shrink-0 space-y-2 group cursor-pointer"
                    >
                      <div className="aspect-square bg-white dark:bg-[#1a1f2c] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 p-2 flex items-center justify-center shadow-sm">
                        <img src={prod.image_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={prod.name} />
                      </div>
                      <div className="px-1">
                        <h4 className="text-[10px] font-black text-slate-700 dark:text-white truncate uppercase tracking-tight">{prod.name}</h4>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">{prod.price} MT</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && activeCategory === 'Profissionais' && featuredProfessionals.length > 0 && (
              <div className="px-6 space-y-4 py-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-widest">Profissionais em Destaque</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {featuredProfessionals.slice(0, 2).map((prof) => (
                    <div
                      key={prof.id}
                      onClick={() => setViewingProfessional(prof)}
                      className="bg-white dark:bg-[#1a1f2c] p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 hover:border-orange-400 transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                        {prof.image_url ? (
                          <img src={prof.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={prof.name} />
                        ) : (
                          <i className="fa-solid fa-user text-xl text-slate-300 dark:text-slate-600"></i>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-black text-slate-700 dark:text-white truncate uppercase tracking-tight">{prof.name}</h4>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-tight">{prof.role || prof.profession}</p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-orange-400 text-xs pr-1"></i>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="p-4 grid grid-cols-1 gap-4">
              {loading ? (
                <SkeletonCard count={6} />
              ) : filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.category === 'Profissional' || item.searchType === 'Profissional') {
                        setViewingProfessional(item);
                        setActiveCategory(null);
                        setFilteredResults([]);
                      } else if (item.company_id || item.searchType === 'Produto') {
                        setViewingProduct(item);
                        setActiveCategory(null);
                        setFilteredResults([]);
                      } else if (item.searchType === 'Alertas') {
                        setDialog({
                          isOpen: true,
                          title: item.name,
                          message: `O serviço de "${item.name}" será ativado em breve. Esta funcionalidade está em fase final de testes.`,
                          type: 'info'
                        });
                      } else if (item.searchType === 'Notícias' || item.searchType === 'Dicas') {
                        setViewingNews(item);
                        setActiveCategory(null);
                        setFilteredResults([]);
                      } else {
                        setViewingCompany(item);
                        setActiveCategory(null);
                        setFilteredResults([]);
                      }
                    }}
                    className={`relative bg-white dark:bg-[#1a1f2c] border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex gap-5 hover:border-orange-400 dark:hover:border-orange-500 transition-all cursor-pointer group shadow-sm active:scale-[0.98] ${item.is_archived ? 'opacity-50 grayscale' : ''}`}
                  >
                    {/* Admin Actions Overlay */}
                    {user?.isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => handleAdminAction(e, 'archive', item)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-90 ${item.is_archived ? 'bg-emerald-500' : 'bg-slate-500'}`}
                          title={item.is_archived ? "Restaurar" : "Arquivar"}
                        >
                          <i className={`fa-solid ${item.is_archived ? 'fa-rotate-left' : 'fa-box-archive'} text-[10px]`}></i>
                        </button>
                        <button
                          onClick={(e) => handleAdminAction(e, 'delete', item)}
                          className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg transition-transform active:scale-90"
                          title="Eliminar"
                        >
                          <i className="fa-solid fa-trash text-[10px]"></i>
                        </button>
                      </div>
                    )}

                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700/30 flex items-center justify-center">
                      {item.logo || item.image_url || item.photo || item.photo_url ? (
                        <img
                          src={item.logo || item.image_url || item.photo || item.photo_url}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                          alt={item.name}
                        />
                      ) : (
                        <i className={`fa-solid ${item.price ? 'fa-box' : 'fa-user'} text-2xl text-slate-300 dark:text-slate-600`}></i>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-700 dark:text-white text-[13px] leading-tight break-words uppercase tracking-tight">{item.name}</h4>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-tight">
                            {item.searchType ? `${item.searchType}: ` : ''}
                            {item.role || item.activity || item.category || 'Membro'}
                          </p>
                        </div>
                        {item.is_verified && (
                          <i className="fa-solid fa-circle-check text-emerald-500 text-[10px] mt-1 shrink-0"></i>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-location-dot text-[9px] text-orange-400"></i>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">{item.location || 'MZ'}</span>
                        </div>
                        {item.rating && (
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-star text-[9px] text-yellow-500"></i>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{item.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-magnifying-glass text-slate-200 dark:text-slate-700 text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nenhum resultado encontrado</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium mt-1 px-10">Tente outra categoria ou verifique a sua ligação.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === AppTab.DISCOVER ? (
          <div className="p-0 flex flex-col animate-in fade-in">
            {showCompanyForm && user && (
              <CompanyForm
                initialData={myCompany || undefined}
                onSubmit={handleRegisterCompany}
                onClose={() => setShowCompanyForm(false)}
                onSwitchToProfessional={() => {
                  setShowCompanyForm(false);
                  setShowProfessionalForm(true);
                }}
                user={user}
                onAlert={(title, message, type) => setDialog({ isOpen: true, title, message, type })}
              />
            )}

            {showProfessionalForm && user && (
              <ProfessionalForm
                user={user}
                onClose={() => setShowProfessionalForm(false)}
                onSuccess={() => {
                  setDialog({
                    isOpen: true,
                    title: 'Sucesso',
                    message: 'Perfil profissional registado com sucesso! Aguarde a aprovação.',
                    type: 'success'
                  });
                  setShowProfessionalForm(false);
                }}
              />
            )}
            {(!showCompanyForm && !showProfessionalForm) && viewingCompany ? (
              <CompanyDetailView
                company={viewingCompany}
                onBack={() => setViewingCompany(null)}
                onEdit={user.isAdmin ? () => {
                  setViewingCompany(null);
                  setShowCompanyForm(true);
                } : undefined}
              />
            ) : viewingProduct ? (
              <ProductDetailView
                product={viewingProduct}
                onBack={() => setViewingProduct(null)}
                onViewCompany={(comp) => {
                  setViewingProduct(null);
                  setViewingCompany(comp);
                }}
                onEdit={user.isAdmin ? () => {
                  // Implement product direct edit if needed, for now use current flow
                  setViewingProduct(null);
                  setViewingCompany(myCompany || {} as any); // fallback or specific logic
                } : undefined}
              />
            ) : viewingProfessional ? (
              <ProfessionalDetailView
                professional={viewingProfessional}
                onBack={() => setViewingProfessional(null)}
              />
            ) : viewingNews ? (
              <NewsDetailView
                news={viewingNews}
                onBack={() => setViewingNews(null)}
              />
            ) : (
              <div className="flex flex-col animate-in fade-in pb-10">
                {/* Hero Slider (Architecture Mirror of Market) */}
                <div className="aspect-video bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                  {featuredCompanies.length > 0 ? (
                    featuredCompanies.map((emp, idx) => (
                      <div key={idx} className={`absolute inset-0 p-6 flex flex-col justify-between transition-all duration-700 ${idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                        {/* Premium Badge top-right */}
                        <div className="absolute top-6 right-6">
                          <span className="px-2 py-1 bg-emerald-500 text-[9px] font-black text-white rounded uppercase tracking-widest shadow-sm">Premium</span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="w-full flex items-center justify-start">
                            <img
                              src={emp.logo}
                              className="max-h-16 max-w-[140px] object-contain"
                              alt={emp.name}
                            />
                          </div>
                          <div className="space-y-1 pr-12">
                            <div>
                              <h4 className="font-black text-slate-700 dark:text-slate-100 text-lg leading-tight break-words">{emp.name}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-tight leading-snug break-words">{emp.activity}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium flex items-center">
                              <i className="fa-solid fa-location-dot mr-2 text-orange-500"></i> {emp.location}
                            </p>

                            {/* Ver Perfil Text Link */}
                            <div
                              onClick={(e) => { e.stopPropagation(); setViewingCompany(emp); }}
                              className="inline-flex items-center gap-2 mt-2 cursor-pointer group/link hover:opacity-80 transition-all"
                            >
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter border-b border-emerald-600/30 dark:border-emerald-500/30 group-hover/link:border-emerald-600 dark:group-hover/link:border-emerald-500 transition-all">Ver Perfil da Empresa</span>
                              <i className="fa-solid fa-arrow-right text-[9px] text-emerald-600 dark:text-emerald-500 transition-transform group-hover/link:translate-x-1"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                        <i className="fa-solid fa-store text-slate-200 dark:text-slate-700 text-3xl"></i>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nenhuma empresa em destaque</p>
                        <p className="text-[9px] text-slate-300 dark:text-slate-600 font-bold uppercase mt-1">Seja o primeiro a aparecer aqui</p>
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
                  className="bg-[#10b981] mb-6 px-6 py-[10px] flex items-center justify-between cursor-pointer border-y border-emerald-500 hover:bg-[#f97316] transition-all group shadow-lg shadow-emerald-50 dark:shadow-none"
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


                {/* Discover Categories Section */}
                <div className="px-6 space-y-3 mt-8 pb-3">
                  <div className="grid grid-cols-2 gap-3">
                    {['Empresas', 'Produtos', 'Profissionais', 'Dicas & Notícias'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className="bg-white dark:bg-[#1a1f2c] border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-3 hover:border-orange-400 transition-all hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none group active:scale-95"
                      >
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-[#10b981] dark:text-emerald-500 group-hover:bg-orange-500 group-hover:text-white rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm">
                          <i className={`fa-solid ${cat === 'Empresas' ? 'fa-building' : cat === 'Produtos' ? 'fa-box' : cat === 'Profissionais' ? 'fa-user' : 'fa-newspaper'}`}></i>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-100 text-[11px] uppercase tracking-tight">{cat}</span>
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
              <div className="aspect-video bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative group">
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
                className="bg-[#10b981] mb-6 px-6 py-[10px] flex items-center justify-between cursor-pointer border-y border-emerald-500 hover:bg-[#f97316] transition-all group shadow-lg shadow-emerald-50 dark:shadow-none"
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
                  { label: 'Fornecedores', icon: 'fa-handshake', color: 'text-emerald-500' },
                  { label: 'Produtores', icon: 'fa-seedling', color: 'text-emerald-500' },
                  { label: 'Consumidores', icon: 'fa-user-tag', color: 'text-orange-500' },
                  { label: 'Profissionais', icon: 'fa-user-tie', color: 'text-emerald-500' },
                  { label: 'Alertas', icon: 'fa-bell', color: 'text-emerald-500' },
                  { label: 'Maquinaria', icon: 'fa-tractor', color: 'text-emerald-500' }
                ].map(cat => (
                  <button key={cat.label} onClick={() => handleCategoryClick(cat.label)} className="bg-white dark:bg-[#1a1f2c] border border-slate-200 dark:border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-4 hover:border-orange-400 transition-all group active:scale-95 shadow-sm">
                    <div className={`w-14 h-14 ${cat.label === 'Consumidores' ? 'bg-orange-500 text-white' : 'bg-slate-50 dark:bg-slate-800/50 ' + cat.color} rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm`}>
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <span className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-widest leading-none text-center">{cat.label}</span>
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
              collection={collection}
              onViewPlant={setSelectedPlant}
              showCollections={showAccountCollections}
              setShowCollections={setShowAccountCollections}
              onAdminAction={(action) => {
                if (action === 'videos') {
                  setShowVideoManagement(true);
                } else if (action === 'collections') {
                  setShowAccountCollections(true);
                } else {
                  handleCategoryClick(action as any);
                }
              }}
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
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-lock text-4xl text-slate-200 dark:text-slate-700"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1e293b] dark:text-slate-100">Área Restrita</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 px-6">Para aceder à sua conta e gerir os seus dados, por favor faça login.</p>
              </div>
              <button
                onClick={() => setActiveTab(AppTab.AUTH)}
                className="w-full max-w-[200px] bg-[#10b981] text-white py-3 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-all"
              >
                Entrar | Registar
              </button>
            </div>
          )
        ) : null}
      </main >

      <NavBar activeTab={activeTab} onTabChange={handleTabChange} />

      {
        selectedPlant && (
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
        )
      }

      <LoadingOverlay isLoading={loading} />

      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />

      {
        showVideoAdForm && (
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
                setAdVideos(prev => {
                  const next = [...prev, embedUrl];
                  setCurrentVideoIndex(next.length - 1); // Jumps exactly to the new one
                  return next;
                });

                setDialog({
                  isOpen: true,
                  title: 'Publicidade Ativada',
                  message: `O vídeo da "${data.companyName}" foi pago e adicionado à playlist com sucesso!`,
                  type: 'success'
                });
              }).catch(err => {
                console.error("Erro CRÍTICO ao salvar vídeo:", err);
                alert("Erro ao salvar vídeo: " + (err.message || 'Erro desconhecido na base de dados'));
                setDialog({
                  isOpen: true,
                  title: 'Erro no Cadastro',
                  message: `Houve um erro técnico: ${err.message || 'Erro ao persistir dado'}. Verifique sua conexão ou permissão.`,
                  type: 'error'
                });
              });

              setShowVideoAdForm(false);
            }}
          />
        )}

      {showVideoManagement && (
        <VideoManagement
          onClose={() => {
            setShowVideoManagement(false);
            // Refresh playlist after management
            databaseService.getVideoAds().then(ads => {
              if (ads.length > 0) {
                setAdVideos(ads.map(ad => ad.embedUrl));
              } else {
                // Reset to defaults if everything was deleted/archived
                setAdVideos([
                  'https://www.youtube.com/embed/hcrHxPRDAvc',
                  'https://www.youtube.com/embed/pJwhw100QTc',
                  'https://www.youtube.com/embed/D-jU2-Dk_hU'
                ]);
              }
            });
          }}
          onAddVideo={() => {
            setShowVideoManagement(false);
            setShowVideoAdForm(true);
          }}
        />
      )}
    </div>
  );
};

export default App;
