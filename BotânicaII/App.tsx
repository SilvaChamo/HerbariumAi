
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppTab, PlantInfo, Recipe, User } from './types';
import { identifyPlant } from './services/geminiService';
import PlantDetail from './components/PlantDetail';

// Tipos estendidos para o Mercado Dinâmico
interface MarketItem {
  id: string;
  category: string;
  title: string;
  location: string;
  description: string;
  contact: string;
  price?: string;
  isVerified: boolean;
  image?: string;
}

type PlanType = 'Free' | 'Básico' | 'Premium' | 'Parceiro';

interface CompanyDetail {
  id?: string;
  name: string;
  activity: string;
  location: string;
  logo: string;
  fullDescription: string;
  services: string[];
  products: { name: string; price?: string }[];
  plan?: PlanType;
  isFeatured?: boolean;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  const [user, setUser] = useState<User | null>(null);
  const [collection, setCollection] = useState<PlantInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantInfo | null>(null);
  const [scanning, setScanning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [language, setLanguage] = useState<'PT' | 'EN'>('PT');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCompany, setViewingCompany] = useState<CompanyDetail | null>(null);
  
  // Controle de Dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  const [myCompany, setMyCompany] = useState<CompanyDetail | null>(null);
  
  // Lógica de Pagamento
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [hasPaidPlan, setHasPaidPlan] = useState(false);
  const [hasPaidFeatured, setHasPaidFeatured] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola' | 'banco' | null>(null);
  const [paymentType, setPaymentType] = useState<'plan' | 'featured' | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [featuredCompanies, setFeaturedCompanies] = useState<CompanyDetail[]>([
    { 
      id: '1',
      name: 'Casa do Agricultor', 
      activity: 'Venda de Insumos e Maquinaria', 
      location: 'Maputo, Av. das Indústrias',
      logo: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150&h=150&fit=crop',
      fullDescription: 'A Casa do Agricultor é líder no fornecimento de soluções tecnológicas para o agronegócio em Moçambique.',
      services: ['Assistência Técnica', 'Consultoria'],
      products: [{ name: 'Trator MF 2024', price: '2.500.000 MZN' }],
      plan: 'Parceiro',
      isFeatured: true
    }
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredCompanies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredCompanies.length]);

  useEffect(() => {
    const savedUser = localStorage.getItem('herbarium_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedColl = localStorage.getItem('herbarium_collection');
    if (savedColl) setCollection(JSON.parse(savedColl));
    const savedCompanies = localStorage.getItem('herbarium_featured');
    if (savedCompanies) setFeaturedCompanies(JSON.parse(savedCompanies));
    const savedMyCompany = localStorage.getItem('herbarium_my_company');
    if (savedMyCompany) setMyCompany(JSON.parse(savedMyCompany));
  }, []);

  const [formData, setFormData] = useState<CompanyDetail>({
    name: '',
    activity: '',
    location: '',
    logo: '',
    fullDescription: '',
    services: [],
    products: [],
    plan: 'Free',
    isFeatured: false
  });

  const getProductLimit = (plan: PlanType): number => {
    if (plan === 'Parceiro') return Infinity;
    if (plan === 'Premium') return 20;
    if (plan === 'Básico') return 5;
    return 0;
  };

  const getPlanPrice = (plan: PlanType): number => {
    if (plan === 'Parceiro') return 5000;
    if (plan === 'Premium') return 1500;
    if (plan === 'Básico') return 500;
    return 0;
  };

  const handleAddServiceField = () => {
    setFormData({ ...formData, services: [...formData.services, ''] });
  };

  const updateService = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData({ ...formData, services: newServices });
  };

  const removeServiceField = (index: number) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const handleAddProductField = () => {
    const limit = getProductLimit(formData.plan || 'Free');
    if (formData.products.length < limit) {
      setFormData({ ...formData, products: [...formData.products, { name: '', price: '' }] });
    } else {
      alert(`Seu plano permite apenas ${limit} produtos.`);
    }
  };

  const updateProduct = (index: number, field: 'name' | 'price', value: string) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const processPayment = () => {
    setIsPaymentProcessing(true);
    setTimeout(() => {
      setIsPaymentProcessing(false);
      if (paymentType === 'plan') setHasPaidPlan(true);
      if (paymentType === 'featured') setHasPaidFeatured(true);
      setPaymentMethod(null);
      setPaymentType(null);
      alert("Pagamento confirmado com sucesso!");
    }, 2000);
  };

  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.plan !== 'Free' && !hasPaidPlan) {
      alert("Por favor, efectue o pagamento do plano.");
      return;
    }
    if (formData.isFeatured && !hasPaidFeatured) {
      alert("Por favor, efectue o pagamento para destacar.");
      return;
    }
    
    const companyWithId = { ...formData, id: Date.now().toString() };
    const newCompanies = [companyWithId, ...featuredCompanies];
    setFeaturedCompanies(newCompanies);
    setMyCompany(companyWithId);
    
    localStorage.setItem('herbarium_featured', JSON.stringify(newCompanies));
    localStorage.setItem('herbarium_my_company', JSON.stringify(companyWithId));
    
    setShowCompanyForm(false);
    setHasPaidPlan(false);
    setHasPaidFeatured(false);
    setPaymentMethod(null);
    alert("Empresa cadastrada com sucesso!");
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser = { id: Date.now().toString(), email, name: fullName || email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('herbarium_user', JSON.stringify(mockUser));
    setActiveTab(AppTab.SCAN);
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Acesso à câmera negado.");
      setScanning(false);
    }
  };

  const captureAndIdentify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      setLoading(true);
      try {
        const plantInfo = await identifyPlant(base64);
        setCollection(prev => [plantInfo, ...prev]);
        setSelectedPlant(plantInfo);
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        setScanning(false);
      } catch (e) {
        alert("Erro na identificação.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-[#f1f5f9] flex flex-col relative overflow-hidden shadow-2xl text-slate-800">
      <header className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center z-[60] relative">
        <div onClick={() => { setShowDashboard(false); setViewingCompany(null); setShowCompanyForm(false); }}>
          <h1 className="text-xl font-bold text-[#1e293b] tracking-tight cursor-pointer">Herbarium<span className="text-[#10b981]">AI</span></h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{user ? `Olá, ${user.name}` : 'BEM-VINDO(A)'}</p>
        </div>
        <div className="flex gap-2 items-center">
           {myCompany && myCompany.plan !== 'Free' && (
             <button onClick={() => setShowDashboard(!showDashboard)} className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${showDashboard ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-50 text-emerald-500 border border-slate-200'}`}>
               <i className="fa-solid fa-chart-line text-sm"></i>
             </button>
           )}
           {user && <button onClick={() => { setUser(null); localStorage.removeItem('herbarium_user'); setActiveTab(AppTab.SCAN); }} className="h-9 w-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:text-orange-500 transition-all"><i className="fa-solid fa-right-from-bracket"></i></button>}
           <button onClick={() => setLanguage(prev => prev === 'PT' ? 'EN' : 'PT')} className="h-9 w-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-orange-50 transition-all">
             <span className="text-[11px] font-black text-[#10b981]">{language === 'PT' ? 'EN' : 'PT'}</span>
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10">
        {showDashboard && myCompany ? (
          /* DASHBOARD DE GESTÃO EMPRESARIAL */
          <div className="p-6 pb-20 space-y-6 animate-in fade-in slide-in-from-bottom">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#1e293b]">Gestão da Empresa</h2>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Painel de Controle • Plano {myCompany.plan}</p>
              </div>
              <button onClick={() => setShowDashboard(false)} className="text-slate-300 hover:text-red-500"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Visualizações</p>
                <p className="text-xl font-black text-emerald-600">1.240</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Destaque</p>
                <p className={`text-xs font-bold ${myCompany.isFeatured ? 'text-orange-500' : 'text-slate-300'}`}>{myCompany.isFeatured ? 'Ativado' : 'Inativo'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex gap-4 items-center border-b border-slate-50 pb-4">
                <img src={myCompany.logo || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                <div>
                  <h3 className="font-bold text-lg">{myCompany.name}</h3>
                  <p className="text-xs text-slate-400"><i className="fa-solid fa-location-dot mr-1"></i> {myCompany.location}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">Actividade</p>
                <p className="text-sm font-medium">{myCompany.activity}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">Serviços Cadastrados ({myCompany.services.length})</p>
                <div className="flex flex-wrap gap-2">
                  {myCompany.services.map((s, i) => (
                    <span key={i} className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-bold">{s}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">Produtos no Catálogo ({myCompany.products.length})</p>
                <div className="space-y-2">
                  {myCompany.products.map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 bg-emerald-50/30 rounded-lg">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-emerald-600 font-black">{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => { setShowDashboard(false); setShowCompanyForm(true); setFormData(myCompany); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">
              <i className="fa-solid fa-pen-to-square mr-2"></i> Editar Informações
            </button>
          </div>
        ) : activeTab === AppTab.DISCOVER ? (
          <div className="p-0 flex flex-col animate-in fade-in">
            {showCompanyForm ? (
              <div className="p-6 pb-20 space-y-6 animate-in slide-in-from-bottom">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#1e293b]">Cadastro Empresarial</h2>
                  <button onClick={() => { setShowCompanyForm(false); setHasPaidPlan(false); setHasPaidFeatured(false); setPaymentMethod(null); }} className="text-slate-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-circle-xmark text-xl"></i></button>
                </div>
                
                <form onSubmit={handleRegisterCompany} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escolha seu Plano</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Free', 'Básico', 'Premium', 'Parceiro'] as PlanType[]).map(p => (
                        <button key={p} type="button" onClick={() => { setFormData({...formData, plan: p, products: []}); setHasPaidPlan(false); }} className={`p-3 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${formData.plan === p ? 'bg-orange-500 border-orange-400 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}>
                          <span>{p}</span>
                          <span className="opacity-80 text-[8px]">{getProductLimit(p) === Infinity ? 'Ilimitado' : getProductLimit(p) === 0 ? 'Sem Catálogo' : `Até ${getProductLimit(p)} Prods`}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibilidade na Home</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.isFeatured} onChange={() => setFormData({...formData, isFeatured: true})} className="accent-orange-500" />
                        <span className="text-xs font-bold">Destacar</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!formData.isFeatured} onChange={() => {setFormData({...formData, isFeatured: false}); setHasPaidFeatured(false);}} className="accent-orange-500" />
                        <span className="text-xs font-bold">Não destacar</span>
                      </label>
                    </div>
                    {formData.isFeatured && (
                      <p className="text-[9px] text-orange-600 font-bold bg-orange-50 p-2 rounded-lg"><i className="fa-solid fa-info-circle mr-1"></i> Destaque: 1.000 MT/mês adicionais.</p>
                    )}
                  </div>

                  {((formData.plan !== 'Free' && !hasPaidPlan) || (formData.isFeatured && !hasPaidFeatured)) && (
                    <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
                      <p className="text-[10px] font-black text-[#10b981] uppercase text-center tracking-widest">Pagamento Necessário</p>
                      <div className="flex flex-col gap-1">
                        {formData.plan !== 'Free' && !hasPaidPlan && (
                          <button type="button" onClick={() => setPaymentType('plan')} className={`text-xs font-bold p-2 rounded-lg border ${paymentType === 'plan' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-50 border-slate-200'}`}>
                            Pagar Plano {formData.plan}: {getPlanPrice(formData.plan!)} MT
                          </button>
                        )}
                        {formData.isFeatured && !hasPaidFeatured && (
                          <button type="button" onClick={() => setPaymentType('featured')} className={`text-xs font-bold p-2 rounded-lg border ${paymentType === 'featured' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-50 border-slate-200'}`}>
                            Pagar Destaque: 1.000 MT
                          </button>
                        )}
                      </div>
                      {paymentType && (
                        <div className="space-y-4">
                          <div className="flex justify-between gap-2">
                            {['mpesa', 'emola', 'banco'].map(method => (
                              <button key={method} type="button" onClick={() => setPaymentMethod(method as any)} className={`flex-1 py-3 rounded-lg border text-[10px] font-bold uppercase ${paymentMethod === method ? 'bg-[#10b981] text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>{method}</button>
                            ))}
                          </div>
                          {paymentMethod && (
                            <div className="space-y-3">
                              <input required type="text" placeholder="Número da conta ou celular" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs" />
                              <button type="button" onClick={processPayment} disabled={isPaymentProcessing} className="w-full bg-[#10b981] text-white py-3 rounded-xl font-bold text-xs uppercase shadow-md active:scale-95 disabled:opacity-50">{isPaymentProcessing ? 'Validando...' : 'Confirmar Pagamento'}</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm" placeholder="Nome da Empresa" />
                  <input required type="text" value={formData.activity} onChange={e => setFormData({...formData, activity: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm" placeholder="Actividade Principal" />
                  <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm" placeholder="Localização" />
                  <input type="url" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm" placeholder="URL do Logótipo (Opcional)" />
                  <textarea rows={3} value={formData.fullDescription} onChange={e => setFormData({...formData, fullDescription: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm" placeholder="Descrição da empresa..." />

                  {/* Serviços Ilimitados */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Serviços Prestados</p>
                    <div className="space-y-2">
                      {formData.services.map((service, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input required type="text" placeholder="Nome do serviço..." value={service} onChange={e => updateService(idx, e.target.value)} className="flex-1 bg-white border border-slate-200 p-3 rounded-xl text-xs" />
                          <button type="button" onClick={() => removeServiceField(idx)} className="w-10 h-10 bg-red-50 text-red-400 border border-red-100 rounded-xl"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={handleAddServiceField} className="w-full py-3 border-2 border-dashed border-emerald-100 rounded-xl text-emerald-500 text-xs font-bold"><i className="fa-solid fa-plus mr-2"></i> Novo Serviço</button>
                  </div>

                  {/* Catálogo de Produtos */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Catálogo</p>
                      {formData.plan !== 'Parceiro' && <button type="button" className="text-[9px] font-black text-orange-500 uppercase px-2 py-1 bg-orange-50 rounded-lg">Fazer Upgrade</button>}
                    </div>
                    {formData.products.map((prod, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2">
                        <input required type="text" placeholder="Produto" value={prod.name} onChange={e => updateProduct(idx, 'name', e.target.value)} className="bg-white border border-slate-200 p-3 rounded-xl text-xs" />
                        <input required type="text" placeholder="Preço" value={prod.price} onChange={e => updateProduct(idx, 'price', e.target.value)} className="bg-white border border-slate-200 p-3 rounded-xl text-xs" />
                      </div>
                    ))}
                    {formData.plan === 'Free' ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-400 italic">Upgrade Plano: Plano Free não permite catálogo.</p>
                      </div>
                    ) : !hasPaidPlan ? (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center opacity-70">
                        <i className="fa-solid fa-lock text-slate-300 mb-2"></i>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pague o plano para liberar produtos</p>
                      </div>
                    ) : (
                      <button type="button" onClick={handleAddProductField} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold">
                        <i className="fa-solid fa-plus mr-2"></i> Adicionar ({formData.products.length}/{getProductLimit(formData.plan || 'Free') === Infinity ? '∞' : getProductLimit(formData.plan || 'Free')})
                      </button>
                    )}
                  </div>

                  <button type="submit" className="w-full bg-[#10b981] hover:bg-orange-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95">Publicar Empresa</button>
                </form>
              </div>
            ) : viewingCompany ? (
              <div className="animate-in slide-in-from-bottom pb-20">
                <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                  <button onClick={() => setViewingCompany(null)} className="h-8 px-3 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase border border-slate-100"><i className="fa-solid fa-arrow-left mr-1"></i> Voltar</button>
                  <span className="text-[9px] font-black text-emerald-600 uppercase border border-emerald-100 px-2 py-1 rounded-lg">Verificado</span>
                </header>
                <div className="p-6 space-y-6">
                  <div className="flex gap-5 items-center">
                    <img src={viewingCompany.logo || 'https://via.placeholder.com/150'} className="w-24 h-24 rounded-2xl object-cover border border-slate-100 bg-slate-50" />
                    <div>
                      <h2 className="text-2xl font-bold text-[#1e293b]">{viewingCompany.name}</h2>
                      <p className="text-xs text-emerald-600 font-bold">{viewingCompany.activity}</p>
                      <p className="text-[10px] text-slate-400 mt-1"><i className="fa-solid fa-location-dot mr-1 text-orange-500"></i> {viewingCompany.location}</p>
                    </div>
                  </div>
                  <div className="space-y-4"><h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Sobre</h3><p className="text-sm text-slate-600 leading-relaxed">{viewingCompany.fullDescription}</p></div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Serviços</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingCompany.services.map((s, i) => (<span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">{s}</span>))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Catálogo de Produtos</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {viewingCompany.products.length > 0 ? viewingCompany.products.map((p, i) => (
                        <div key={i} className="bg-white p-4 border border-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                          <span className="text-xs font-bold text-slate-700">{p.name}</span>
                          <span className="text-xs font-black text-emerald-600">{p.price}</span>
                        </div>
                      )) : <p className="text-xs text-slate-400 italic">Nenhum produto listado.</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                <div className="px-6 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destaques do Mercado</p>
                    <button onClick={() => setShowCompanyForm(true)} className="text-[9px] font-black text-orange-500 border border-orange-200 px-2.5 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all uppercase">Anunciar Empresa</button>
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

                <div className="px-6 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <i className="fa-solid fa-sun absolute top-[-5px] right-[-5px] text-orange-50 text-4xl"></i>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Tempo Maputo</p>
                    <span className="text-2xl font-black text-[#1e293b]">29°C</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Preço Médio</p>
                    <div className="text-[10px] font-black text-emerald-600">Milho: 42 MT/Kg</div>
                  </div>
                </div>

                <div className="px-6 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Categorias</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Empresas', 'Produtos', 'Profissionais', 'Serviços'].map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-orange-400 transition-all group active:scale-95">
                        <div className="w-10 h-10 bg-emerald-50 text-[#10b981] group-hover:bg-orange-500 group-hover:text-white rounded-lg flex items-center justify-center text-lg transition-all"><i className={`fa-solid ${cat === 'Empresas' ? 'fa-building' : cat === 'Produtos' ? 'fa-box' : cat === 'Profissionais' ? 'fa-user' : 'fa-handshake'}`}></i></div>
                        <span className="font-bold text-slate-800 text-[11px] uppercase">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === AppTab.SCAN ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            {!scanning ? (
              <div className="space-y-10 animate-in fade-in zoom-in w-full">
                <div onClick={startCamera} className="w-48 h-48 bg-white rounded-full flex items-center justify-center mx-auto relative shadow-xl hover:shadow-orange-100 group transition-all cursor-pointer">
                  <div className="absolute inset-0 border-[3px] border-[#10b981] group-hover:border-orange-500 border-dashed rounded-full animate-[spin_20s_linear_infinite] opacity-60"></div>
                  <div className="w-40 h-40 bg-[#f0fdf4] group-hover:bg-orange-50 rounded-full flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-camera text-5xl text-[#10b981] group-hover:text-orange-500"></i>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-[#1e293b]">Scanner Botânico</h2>
                  <p className="text-slate-500 text-sm px-8 leading-relaxed font-medium">Capture imagens para identificar plantas e diagnosticar pragas em tempo real.</p>
                </div>
                <button onClick={startCamera} className="bg-[#10b981] hover:bg-orange-500 text-white px-14 py-4 rounded-full font-bold shadow-lg transition-all active:scale-95">Capturar Agora</button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col p-4 space-y-4">
                <div className="relative rounded-xl overflow-hidden flex-1 bg-black shadow-inner border-4 border-white">
                  <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setScanning(false)} className="bg-white text-slate-400 h-16 w-16 rounded-xl border border-slate-200 shadow-sm"><i className="fa-solid fa-xmark text-xl"></i></button>
                  <button onClick={captureAndIdentify} className="flex-1 bg-[#10b981] hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl">{loading ? 'Analisando...' : 'Capturar'}</button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === AppTab.COLLECTION ? (
          <div className="h-full flex flex-col p-6 bg-[#f8fafc]">
            {user ? (
              <div className="w-full space-y-6">
                <h2 className="text-2xl font-bold text-[#1e293b]">Meu Repositório</h2>
                {collection.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 text-slate-400">
                    <i className="fa-solid fa-leaf text-4xl opacity-20"></i>
                    <p className="text-sm">Seu repositório está vazio.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {collection.map(p => (
                      <div key={p.id} onClick={() => setSelectedPlant(p)} className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group cursor-pointer transition-all hover:shadow-md">
                        <img src={p.imageUrl} className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                        <div className="p-2">
                          <p className="font-bold text-xs truncate text-[#1e293b]">{p.customName || p.name}</p>
                          <p className="text-[9px] text-slate-400 italic truncate">{p.scientificName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-sm"><i className="fa-solid fa-lock text-4xl text-slate-200"></i></div>
                <h2 className="text-2xl font-bold text-[#1e293b]">Área Restrita</h2>
                <button onClick={() => setActiveTab(AppTab.AUTH)} className="w-full max-w-xs bg-[#0ca678] text-white py-4 rounded-full font-bold shadow-lg">Entrar / Registar</button>
              </div>
            )}
          </div>
        ) : activeTab === AppTab.AUTH ? (
          <div className="p-8 h-full flex flex-col justify-center animate-in slide-in-from-bottom">
             <button onClick={() => setActiveTab(AppTab.SCAN)} className="mb-8 text-slate-400 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm"><i className="fa-solid fa-arrow-left"></i></button>
             <h2 className="text-3xl font-bold text-[#1e293b] mb-6">{isRegistering ? 'Criar Nova Conta' : 'Acesse seu Repositório'}</h2>
             <form onSubmit={handleAuth} className="space-y-4">
               {isRegistering && <input required type="text" placeholder="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none" />}
               <input required type="email" placeholder="Seu email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none" />
               <input required type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none" />
               <button type="submit" className="w-full bg-[#10b981] hover:bg-orange-500 text-white py-4 rounded-full font-bold shadow-lg transition-all">{isRegistering ? 'Finalizar Registro' : 'Entrar Agora'}</button>
             </form>
             <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center mt-6 text-[#10b981] text-sm font-bold">{isRegistering ? 'Já tem conta? Entrar' : 'Novo por aqui? Criar conta gratuita'}</button>
          </div>
        ) : null}
      </main>

      <nav className="bg-white border-t border-slate-100 flex justify-between items-center z-50">
        <button onClick={() => { setActiveTab(AppTab.SCAN); setShowDashboard(false); setViewingCompany(null); setShowCompanyForm(false); setIsSearchOpen(false); }} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.SCAN ? 'text-[#10b981]' : 'text-slate-300'}`}>
          <i className="fa-solid fa-camera-retro text-xl"></i>
          <span className="text-[8px] font-bold uppercase">Scanner</span>
        </button>
        <button onClick={() => { setActiveTab(AppTab.COLLECTION); setShowDashboard(false); setViewingCompany(null); setShowCompanyForm(false); setIsSearchOpen(false); }} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.COLLECTION ? 'text-[#10b981]' : 'text-slate-300'}`}>
          <i className="fa-solid fa-leaf text-xl"></i>
          <span className="text-[8px] font-bold uppercase">Repositório</span>
        </button>
        <button onClick={() => { setActiveTab(AppTab.DISCOVER); setShowDashboard(false); setViewingCompany(null); setShowCompanyForm(false); }} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.DISCOVER ? 'text-[#10b981]' : 'text-slate-300'}`}>
          <i className="fa-solid fa-cart-shopping text-xl"></i>
          <span className="text-[8px] font-bold uppercase">Mercado</span>
        </button>
      </nav>

      {selectedPlant && (
        <PlantDetail 
          plant={selectedPlant} 
          onClose={() => setSelectedPlant(null)} 
          onUpdateCustomName={(id, name) => {
            const updated = collection.map(p => p.id === id ? {...p, customName: name} : p);
            setCollection(updated);
            localStorage.setItem('herbarium_collection', JSON.stringify(updated));
            setSelectedPlant(null);
          }} 
          onAddRecipe={()=>{}} 
        />
      )}
      
      {loading && (
        <div className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
          <div className="w-16 h-16 border-[6px] border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin mb-6"></div>
          <p className="font-bold text-[#1e293b] text-lg tracking-tight uppercase">Analisando...</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;
