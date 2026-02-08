import React, { useState, useEffect } from 'react';
import { creditMonitor } from '../../services/creditMonitor';
import { offlineService } from '../../services/offlineService';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [usage, setUsage] = useState(creditMonitor.getUsageStats());
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Monitorar status de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitorar uso de crédito
    const usageInterval = setInterval(() => {
      const currentUsage = creditMonitor.getUsageStats();
      setUsage(currentUsage);
      
      // Mostrar warning se necessário
      if (currentUsage.status !== 'healthy') {
        setShowWarning(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(usageInterval);
    };
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (usage.status === 'exhausted') return 'bg-red-600';
    if (usage.status === 'critical') return 'bg-orange-500';
    if (usage.status === 'warning') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (usage.status === 'exhausted') return 'Crédito Esgotado';
    if (usage.status === 'critical') return 'Crédito Crítico';
    if (usage.status === 'warning') return 'Crédito Baixo';
    return 'Online';
  };

  const handleDownloadData = async () => {
    try {
      // Implementar download de dados essenciais
      console.log('Downloading essential data for offline use...');
      // Isso seria implementado com chamadas reais à API
    } catch (error) {
      console.error('Failed to download data:', error);
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Indicador de status */}
      <div className="flex items-center space-x-2 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
        <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
        
        {!isOnline && (
          <button
            onClick={() => window.location.reload()}
            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Reconectar
          </button>
        )}
      </div>

      {/* Warning de crédito */}
      {showWarning && usage.status !== 'healthy' && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className={`w-4 h-4 rounded-full mt-0.5 ${
              usage.status === 'exhausted' ? 'bg-red-500' :
              usage.status === 'critical' ? 'bg-orange-500' : 'bg-yellow-500'
            }`}></div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-900">
                {usage.status === 'exhausted' ? 'Crédito Esgotado!' :
                 usage.status === 'critical' ? 'Crédito Crítico' : 'Aviso de Crédito'}
              </h4>
              
              <p className="text-xs text-gray-600 mt-1">
                {usage.remainingOperations} operações restantes ({usage.remainingPercentage.toFixed(1)}%)
              </p>
              
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleDownloadData}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Baixar Dados
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de progresso de uso */}
      {isOnline && usage.today && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">
            Uso de crédito: {usage.today.operations} ops
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usage.status === 'exhausted' ? 'bg-red-500' :
                usage.status === 'critical' ? 'bg-orange-500' :
                usage.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${100 - usage.remainingPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
