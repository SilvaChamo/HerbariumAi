interface CreditUsage {
  date: string;
  operations: number;
  cost: number;
  limit: number;
  warningThreshold: number;
}

interface CreditAlert {
  type: 'warning' | 'critical' | 'exhausted';
  message: string;
  remainingOperations: number;
  recommendedAction: string;
}

class CreditMonitor {
  private dailyLimit: number = 1000; // Configurável
  private warningThreshold: number = 0.8; // 80%
  private criticalThreshold: number = 0.95; // 95%
  private currentUsage: CreditUsage | null = null;

  constructor(dailyLimit: number = 1000) {
    this.dailyLimit = dailyLimit;
    this.loadCurrentUsage();
  }

  async loadCurrentUsage(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Tentar carregar do IndexedDB
    if ('indexedDB' in window) {
      try {
        const request = indexedDB.open('HerbariumOfflineDB');
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['usage'], 'readonly');
          const store = transaction.objectStore('usage');
          const getRequest = store.get(today);
          
          getRequest.onsuccess = () => {
            this.currentUsage = getRequest.result || {
              date: today,
              operations: 0,
              cost: 0,
              limit: this.dailyLimit,
              warningThreshold: this.warningThreshold
            };
          };
        };
      } catch (error) {
        console.error('Failed to load usage from IndexedDB:', error);
      }
    }

    // Fallback para localStorage
    const stored = localStorage.getItem(`credit-usage-${today}`);
    if (stored) {
      this.currentUsage = JSON.parse(stored);
    } else {
      this.currentUsage = {
        date: today,
        operations: 0,
        cost: 0,
        limit: this.dailyLimit,
        warningThreshold: this.warningThreshold
      };
    }
  }

  async trackOperation(operation: string, estimatedCost: number = 1): Promise<CreditAlert | null> {
    if (!this.currentUsage) {
      await this.loadCurrentUsage();
    }

    if (!this.currentUsage) return null;

    // Incrementar uso
    this.currentUsage.operations += 1;
    this.currentUsage.cost += estimatedCost;

    // Salvar uso atual
    await this.saveUsage();

    // Verificar limites
    const usagePercentage = this.currentUsage.cost / this.currentUsage.limit;
    const remainingOperations = Math.floor((this.currentUsage.limit - this.currentUsage.cost) / estimatedCost);

    if (usagePercentage >= 1) {
      return {
        type: 'exhausted',
        message: 'Crédito esgotado! Mudando para modo offline.',
        remainingOperations: 0,
        recommendedAction: 'Baixe dados essenciais e continue offline'
      };
    }

    if (usagePercentage >= this.criticalThreshold) {
      return {
        type: 'critical',
        message: 'Crédito quase esgotado! Considere modo offline.',
        remainingOperations,
        recommendedAction: 'Baixe dados agora e prepare para trabalhar offline'
      };
    }

    if (usagePercentage >= this.warningThreshold) {
      return {
        type: 'warning',
        message: 'Aproximando-se do limite de crédito.',
        remainingOperations,
        recommendedAction: 'Comece a baixar dados para modo offline'
      };
    }

    return null;
  }

  private async saveUsage(): Promise<void> {
    if (!this.currentUsage) return;

    // Salvar no IndexedDB
    if ('indexedDB' in window) {
      try {
        const request = indexedDB.open('HerbariumOfflineDB');
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['usage'], 'readwrite');
          const store = transaction.objectStore('usage');
          store.put(this.currentUsage);
        };
      } catch (error) {
        console.error('Failed to save usage to IndexedDB:', error);
      }
    }

    // Fallback para localStorage
    localStorage.setItem(
      `credit-usage-${this.currentUsage.date}`,
      JSON.stringify(this.currentUsage)
    );
  }

  getCurrentUsage(): CreditUsage | null {
    return this.currentUsage;
  }

  getRemainingOperations(estimatedCostPerOperation: number = 1): number {
    if (!this.currentUsage) return this.dailyLimit;
    
    return Math.floor((this.currentUsage.limit - this.currentUsage.cost) / estimatedCostPerOperation);
  }

  shouldGoOffline(): boolean {
    if (!this.currentUsage) return false;
    
    const usagePercentage = this.currentUsage.cost / this.currentUsage.limit;
    return usagePercentage >= this.warningThreshold;
  }

  async resetDaily(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    this.currentUsage = {
      date: today,
      operations: 0,
      cost: 0,
      limit: this.dailyLimit,
      warningThreshold: this.warningThreshold
    };
    await this.saveUsage();
  }

  // Estatísticas detalhadas
  getUsageStats(): {
    today: CreditUsage | null;
    remainingPercentage: number;
    remainingOperations: number;
    status: 'healthy' | 'warning' | 'critical' | 'exhausted';
  } {
    if (!this.currentUsage) {
      return {
        today: null,
        remainingPercentage: 100,
        remainingOperations: this.dailyLimit,
        status: 'healthy'
      };
    }

    const usagePercentage = this.currentUsage.cost / this.currentUsage.limit;
    const remainingPercentage = Math.max(0, 100 - (usagePercentage * 100));
    const remainingOperations = this.getRemainingOperations();

    let status: 'healthy' | 'warning' | 'critical' | 'exhausted' = 'healthy';
    if (usagePercentage >= 1) status = 'exhausted';
    else if (usagePercentage >= this.criticalThreshold) status = 'critical';
    else if (usagePercentage >= this.warningThreshold) status = 'warning';

    return {
      today: this.currentUsage,
      remainingPercentage,
      remainingOperations,
      status
    };
  }
}

// Singleton instance
export const creditMonitor = new CreditMonitor(1000); // 1000 operações por dia

// Hook para React (se necessário)
export const useCreditMonitor = () => {
  const [usage, setUsage] = React.useState(creditMonitor.getUsageStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setUsage(creditMonitor.getUsageStats());
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    usage,
    trackOperation: creditMonitor.trackOperation.bind(creditMonitor),
    shouldGoOffline: creditMonitor.shouldGoOffline(),
    resetDaily: creditMonitor.resetDaily.bind(creditMonitor)
  };
};
