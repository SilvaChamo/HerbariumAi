
import React, { useEffect, useState } from 'react';
import { PlantInfo, Recipe } from '../types';
import { databaseService } from '../services/databaseService';

interface PlantDetailProps {
  plant: PlantInfo;
  onClose: () => void;
  onUpdateCustomName: (id: string, name: string) => void;
  onAddRecipe: (id: string, recipe: Recipe) => void;
}

const PlantDetail: React.FC<PlantDetailProps> = ({ plant, onClose, onUpdateCustomName, onAddRecipe }) => {
  useEffect(() => {
    if (plant.id) {
      databaseService.logPageView('plant', plant.id).catch(console.error);
    }
  }, [plant.id]);

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [tempName, setTempName] = useState(plant.customName || '');
  const [newRecipe, setNewRecipe] = useState<Recipe>({ type: 'Remédio', title: '', ingredients: [], instructions: [] });

  const handleSaveName = () => {
    onUpdateCustomName(plant.id, tempName);
    setIsEditing(false);
  };

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.title) return;
    onAddRecipe(plant.id, newRecipe);
    setIsAddingRecipe(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom">
      <div className="relative h-72">
        <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
        <button onClick={onClose} className="absolute top-4 left-4 bg-black/30 hover:bg-orange-500 backdrop-blur-md p-2 rounded-full text-white transition-all">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 plant-card-gradient text-white">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wider">{plant.scientificName}</p>
              <h1 className="text-3xl font-bold">{plant.customName || plant.name}</h1>
            </div>
            <button onClick={() => setIsEditing(true)} className="bg-emerald-500 hover:bg-orange-500 p-3 rounded-full shadow-lg transition-all active:scale-95">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 pb-32">
        {plant.diagnosis?.hasDisease && (
          <section className="bg-red-50 border border-red-100 rounded-lg p-6 shadow-sm">
            <h2 className="text-red-700 font-bold flex items-center gap-2 mb-3">
              <i className="fa-solid fa-triangle-exclamation"></i> Diagnóstico de Doença
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-red-400 uppercase">Problema Identificado</p>
                <p className="text-slate-800 font-semibold">{plant.diagnosis.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 uppercase">Sintomas</p>
                <p className="text-slate-600 text-sm">{plant.diagnosis.symptoms}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-50">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Cura ou Pesticida</p>
                <p className="text-slate-800 font-bold mb-2">{plant.diagnosis.pesticideOrCure}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400">Onde Comprar (Moçambique)</p>
                    <p className="text-xs font-bold text-slate-700">{plant.diagnosis.whereToBuyMozambique || 'Agro-pecuárias locais'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Custo Estimado</p>
                    <p className="text-sm font-black text-emerald-600">{plant.diagnosis.estimatedCostMZN || 'Sob consulta'} MZN</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {isEditing && (
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex gap-2 animate-in zoom-in">
            <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="flex-1 bg-white border border-emerald-200 rounded-lg px-4 py-2 focus:border-orange-400 outline-none transition-colors" placeholder="Nome personalizado..." />
            <button onClick={handleSaveName} className="bg-emerald-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold transition-all">Salvar</button>
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-leaf text-emerald-500"></i> Sobre a Espécie
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {plant.properties.map((p, i) => (
              <span key={i} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{p}</span>
            ))}
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{plant.history}</p>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Minhas Receitas</h2>
            <button onClick={() => setIsAddingRecipe(true)} className="bg-emerald-50 hover:bg-orange-50 text-emerald-600 hover:text-orange-500 p-2 rounded-lg border border-emerald-100 hover:border-orange-200 transition-all">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>

          <div className="space-y-4">
            {plant.recipes.map((recipe, i) => (
              <div key={i} className="bg-white border border-slate-100 p-6 rounded-lg shadow-sm space-y-4 hover:border-orange-100 transition-colors">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-slate-800">{recipe.title}</h3>
                  <span className="text-[10px] font-bold text-emerald-600 hover:text-orange-500 cursor-default uppercase tracking-widest">{recipe.type}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{recipe.ingredients.join(', ')}</p>
                <ol className="text-xs text-slate-600 space-y-1">
                  {recipe.instructions.map((step, idx) => <li key={idx}>{idx + 1}. {step}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlantDetail;
