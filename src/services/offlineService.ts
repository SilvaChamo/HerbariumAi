import { PlantInfo, CompanyDetail, VideoAd } from '../types';

// Configuração do IndexedDB
const DB_NAME = 'HerbariumOfflineDB';
const DB_VERSION = 1;
const STORES = {
  plants: 'plants',
  companies: 'companies',
  videoAds: 'videoAds',
  queue: 'queue',
  usage: 'usage'
};

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Criar stores
        if (!db.objectStoreNames.contains(STORES.plants)) {
          db.createObjectStore(STORES.plants, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.companies)) {
          db.createObjectStore(STORES.companies, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.videoAds)) {
          db.createObjectStore(STORES.videoAds, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.queue)) {
          db.createObjectStore(STORES.queue, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORES.usage)) {
          db.createObjectStore(STORES.usage, { keyPath: 'date' });
        }
      };
    });
  }

  async get(storeName: string, key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async set(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async add(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

const offlineDB = new OfflineDB();

// Serviço de gerenciamento offline
export const offlineService = {
  // Inicialização
  async init() {
    await offlineDB.init();
    console.log('Offline service initialized');
  },

  // Plantas
  async cachePlants(plants: PlantInfo[]): Promise<void> {
    for (const plant of plants) {
      await offlineDB.set(STORES.plants, plant);
    }
  },

  async getCachedPlants(): Promise<PlantInfo[]> {
    return await offlineDB.getAll(STORES.plants);
  },

  async getPlant(id: string): Promise<PlantInfo | null> {
    return await offlineDB.get(STORES.plants, id);
  },

  async savePlantOffline(plant: PlantInfo): Promise<void> {
    await offlineDB.set(STORES.plants, plant);
    await this.addToQueue({
      type: 'savePlant',
      data: plant,
      timestamp: Date.now()
    });
  },

  // Empresas
  async cacheCompanies(companies: CompanyDetail[]): Promise<void> {
    for (const company of companies) {
      await offlineDB.set(STORES.companies, company);
    }
  },

  async getCachedCompanies(): Promise<CompanyDetail[]> {
    return await offlineDB.getAll(STORES.companies);
  },

  async saveCompanyOffline(company: CompanyDetail): Promise<void> {
    await offlineDB.set(STORES.companies, company);
    await this.addToQueue({
      type: 'saveCompany',
      data: company,
      timestamp: Date.now()
    });
  },

  // Video Ads
  async cacheVideoAds(ads: VideoAd[]): Promise<void> {
    for (const ad of ads) {
      await offlineDB.set(STORES.videoAds, ad);
    }
  },

  async getCachedVideoAds(): Promise<VideoAd[]> {
    return await offlineDB.getAll(STORES.videoAds);
  },

  // Fila de operações offline
  async addToQueue(operation: any): Promise<void> {
    await offlineDB.add(STORES.queue, operation);
  },

  async getQueue(): Promise<any[]> {
    return await offlineDB.getAll(STORES.queue);
  },

  async clearQueue(): Promise<void> {
    await offlineDB.clear(STORES.queue);
  },

  // Monitoramento de uso
  async trackUsage(operation: string, cost: number = 1): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await offlineDB.get(STORES.usage, today) || { operations: 0, cost: 0 };
    
    const updated = {
      date: today,
      operations: existing.operations + 1,
      cost: existing.cost + cost
    };

    await offlineDB.set(STORES.usage, updated);
  },

  async getUsageStats(): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    return await offlineDB.get(STORES.usage, today);
  },

  // Verificação de status online/offline
  isOnline(): boolean {
    return navigator.onLine;
  },

  // Forçar sincronização
  async syncNow(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
    } else {
      // Fallback para browsers sem background sync
      await this.manualSync();
    }
  },

  async manualSync(): Promise<void> {
    const queue = await this.getQueue();
    console.log('Syncing offline operations:', queue.length);
    
    // Implementar sincronização manual aqui
    // Esta função seria chamada quando voltar online
  }
};

// Event listeners para status de conexão
window.addEventListener('online', () => {
  console.log('App is online');
  offlineService.syncNow();
});

window.addEventListener('offline', () => {
  console.log('App is offline');
});
