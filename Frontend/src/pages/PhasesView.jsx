import { useState } from 'react';
import { PlusCircle, CheckCircle2, Circle, X, Loader2 } from 'lucide-react';

export default function PhasesView({ phases, onAddPhase, onUpdatePhase }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: '', status: 'pendiente', date: '' });

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ id: null, title: '', status: 'pendiente', date: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (phase) => {
    setModalMode('edit');
    setFormData(phase);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await onAddPhase({
          title: formData.title,
          status: formData.status,
          date: formData.date || '-'
        });
      } else {
        await onUpdatePhase({
          id: formData.id,
          title: formData.title,
          status: formData.status,
          date: formData.date || '-'
        });
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cronograma y Fases</h3>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Fase
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {(phases || []).map((phase) => (
          <div key={phase.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              {phase.status === 'completado' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : phase.status === 'en_progreso' ? (
                <Circle className="w-6 h-6 text-amber-500 fill-amber-100" />
              ) : (
                <Circle className="w-6 h-6 text-slate-300" />
              )}
              <div>
                <h4 className={`font-medium ${phase.status === 'completado' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                  {phase.title}
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Estado: {phase.status ? phase.status.replace('_', ' ') : 'pendiente'} • Fecha: {phase.date}
                </p>
              </div>
            </div>
            <button
              onClick={() => openEditModal(phase)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
            >
              Actualizar
            </button>
          </div>
        ))}
        {(phases || []).length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No hay fases registradas. ¡Añade tu primera fase del proyecto!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalMode === 'add' ? 'Añadir Nueva Fase' : 'Actualizar Fase'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form id="phase-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Fase</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Ej: Recolección de Datos"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha (Opcional)</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    value={formData.date === '-' ? '' : formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </form>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="phase-form"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === 'add' ? 'Crear Fase' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
