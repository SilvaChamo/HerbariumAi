import { PlantInfo, CompanyDetail, VideoAd } from '../types';
import { databaseService } from './databaseService';
import { offlineService } from './offlineService';
import { creditMonitor } from './creditMonitor';

// Serviço que gerencia dados com fallback offline-first
export const offlineDataService = {
  // Inicialização
  async init() {
    await offlineService.init();
    console.log('Offline data service initialized');
  },

  // Plantas - Offline First
  async getPlants(userId: string): Promise<PlantInfo[]> {
    try {
      // Tentar obter do cache offline primeiro
      const cachedPlants = await offlineService.getCachedPlants();
      
      // Se tiver dados cacheados e estiver offline, retornar cache
      if (cachedPlants.length > 0 && !offlineService.isOnline()) {
        console.log('Using cached plants data');
        return cachedPlants;
      }

      // Se estiver online, tentar buscar dados frescos
      if (offlineService.isOnline()) {
        try {
          const freshPlants = await databaseService.getCollection(userId);
          
          // Atualizar cache com dados frescos
          await offlineService.cachePlants(freshPlants);
          
          // Track usage
          await creditMonitor.trackOperation('getPlants', 1);
          
          return freshPlants;
        } catch (error) {
          console.error('Failed to fetch fresh plants, using cache:', error);
          return cachedPlants;
        }
      }

      return cachedPlants;
    } catch (error) {
      console.error('Error getting plants:', error);
      return [];
    }
  },

  async savePlant(plant: PlantInfo, userId: string): Promise<PlantInfo> {
    try {
      if (offlineService.isOnline()) {
        // Tentar salvar online primeiro
        const savedPlant = await databaseService.savePlant(plant, userId);
        await creditMonitor.trackOperation('savePlant', 2);
        
        // Atualizar cache
        await offlineService.savePlantOffline(savedPlant);
        
        return savedPlant;
      } else {
        // Salvar offline apenas
        await offlineService.savePlantOffline(plant);
        console.log('Plant saved offline, will sync when online');
        return plant;
      }
    } catch (error) {
      console.error('Error saving plant:', error);
      // Fallback para offline
      await offlineService.savePlantOffline(plant);
      return plant;
    }
  },

  // Empresas - Offline First
  async getCompanies(): Promise<CompanyDetail[]> {
    try {
      // Tentar obter do cache offline primeiro
      const cachedCompanies = await offlineService.getCachedCompanies();
      
      if (cachedCompanies.length > 0 && !offlineService.isOnline()) {
        console.log('Using cached companies data');
        return cachedCompanies;
      }

      // Se estiver online, tentar buscar dados frescos
      if (offlineService.isOnline()) {
        try {
          const freshCompanies = await databaseService.getCompanies();
          
          // Atualizar cache
          await offlineService.cacheCompanies(freshCompanies);
          
          // Track usage
          await creditMonitor.trackOperation('getCompanies', 1);
          
          return freshCompanies;
        } catch (error) {
          console.error('Failed to fetch fresh companies, using cache:', error);
          return cachedCompanies;
        }
      }

      return cachedCompanies;
    } catch (error) {
      console.error('Error getting companies:', error);
      return [];
    }
  },

  async saveCompany(company: CompanyDetail, userId: string): Promise<CompanyDetail> {
    try {
      if (offlineService.isOnline()) {
        const savedCompany = await databaseService.saveCompany(company, userId);
        await creditMonitor.trackOperation('saveCompany', 2);
        
        // Atualizar cache
        await offlineService.saveCompanyOffline(savedCompany);
        
        return savedCompany;
      } else {
        await offlineService.saveCompanyOffline(company);
        console.log('Company saved offline, will sync when online');
        return company;
      }
    } catch (error) {
      console.error('Error saving company:', error);
      await offlineService.saveCompanyOffline(company);
      return company;
    }
  },

  // Video Ads - Offline First
  async getVideoAds(): Promise<VideoAd[]> {
    try {
      const cachedAds = await offlineService.getCachedVideoAds();
      
      if (cachedAds.length > 0 && !offlineService.isOnline()) {
        console.log('Using cached video ads data');
        return cachedAds;
      }

      if (offlineService.isOnline()) {
        try {
          const freshAds = await databaseService.getVideoAds();
          
          // Atualizar cache
          await offlineService.cacheVideoAds(freshAds);
          
          // Track usage
          await creditMonitor.trackOperation('getVideoAds', 1);
          
          return freshAds;
        } catch (error) {
          console.error('Failed to fetch fresh video ads, using cache:', error);
          return cachedAds;
        }
      }

      return cachedAds;
    } catch (error) {
      console.error('Error getting video ads:', error);
      return [];
    }
  },

  // Sincronização
  async syncOfflineData(): Promise<void> {
    if (!offlineService.isOnline()) {
      console.log('Cannot sync while offline');
      return;
    }

    try {
      console.log('Starting offline data sync...');
      await offlineService.syncNow();
      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Error during sync:', error);
    }
  },

  // Download massivo para modo offline
  async downloadEssentialData(userId: string): Promise<void> {
    if (!offlineService.isOnline()) {
      throw new Error('Cannot download data while offline');
    }

    try {
      console.log('Downloading essential data for offline use...');
      
      // Download em paralelo para economizar tempo
      const [plants, companies, videoAds] = await Promise.all([
        this.getPlants(userId),
        this.getCompanies(),
        this.getVideoAds()
      ]);

      console.log(`Downloaded: ${plants.length} plants, ${companies.length} companies, ${videoAds.length} video ads`);
      
      // Track usage do download
      await creditMonitor.trackOperation('downloadEssentialData', 5);
      
    } catch (error) {
      console.error('Error downloading essential data:', error);
      throw error;
    }
  },

  // Verificar status
  async getOfflineStatus(): Promise<{
    isOnline: boolean;
    hasCachedData: boolean;
    pendingOperations: number;
    creditStatus: any;
  }> {
    const isOnline = offlineService.isOnline();
    const queue = await offlineService.getQueue();
    const creditStatus = creditMonitor.getUsageStats();
    
    const cachedPlants = await offlineService.getCachedPlants();
    const cachedCompanies = await offlineService.getCachedCompanies();
    const hasCachedData = cachedPlants.length > 0 || cachedCompanies.length > 0;

    return {
      isOnline,
      hasCachedData,
      pendingOperations: queue.length,
      creditStatus
    };
  }
};
