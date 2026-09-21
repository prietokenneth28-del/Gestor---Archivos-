import { useState } from 'react';
import { PlusCircle, Bot, Pencil, Trash2, Loader2, X, AlertCircle, Sparkles, Send } from 'lucide-react';

export default function AILogsView({ logs, onAddLog, onGeminiQuery, onUpdateLog, onDeleteLog }) {
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [submitting, setSubmitting] = useState(false);
  const [geminiQuerying, setGeminiQuerying] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Formulario manual
  const [formData, setFormData] = useState({
    id: null,
    tool: 'Gemini',
    prompt: '',
    aiResponse: '',
    usage: ''
  });

  // Formulario Gemini AI live
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [geminiUsage, setGeminiUsage] = useState('');
  const [geminiResult, setGeminiResult] = useState(null);
  const [geminiError, setGeminiError] = useState('');

  const openAddManualModal = () => {
    setModalMode('add');
    setFormData({ id: null, tool: 'Gemini', prompt: '', aiResponse: '', usage: '' });
    setIsManualModalOpen(true);
  };

  const openEditModal = (log) => {
    setModalMode('edit');
    setFormData({
      id: log.id,
      tool: log.tool,
      prompt: log.prompt,
      aiResponse: log.aiResponse,
      usage: log.usage
    });
    setIsManualModalOpen(true);
  };

  const openGeminiModal = () => {
    setGeminiPrompt('');
    setGeminiUsage('');
    setGeminiResult(null);
    setGeminiError('');
    setIsGeminiModalOpen(true);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await onAddLog({
          tool: formData.tool,
          prompt: formData.prompt,
          aiResponse: formData.aiResponse,
          usage: formData.usage
        });
      } else {
        await onUpdateLog(formData);
      }
      setIsManualModalOpen(false);
      setFormData({ id: null, tool: 'Gemini', prompt: '', aiResponse: '', usage: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeminiSubmit = async (e) => {
    e.preventDefault();
    setGeminiQuerying(true);
    setGeminiError('');
    setGeminiResult(null);
    try {
      const createdLog = await onGeminiQuery(geminiPrompt, geminiUsage);
      setGeminiResult(createdLog);
    } catch (err) {
      setGeminiError(err.message || "No se pudo generar la respuesta con Gemini");
    } finally {
      setGeminiQuerying(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro de la Bitácora de IA?")) {
      setDeletingId(id);
      try {
        await onDeleteLog(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Bitácora de Inteligencia Artificial</h3>
          <p className="text-sm text-slate-500">Registra y audita la trazabilidad del uso de IA en tu documento.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openGeminiModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Consultar Gemini IA
          </button>
          <button
            onClick={openAddManualModal}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Registro Manual
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {(logs || []).map((log) => (
          <div key={log.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-slate-800">{log.tool}</span>
                <span className="text-sm text-slate-500">• {log.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(log)}
                  title="Editar registro"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(log.id)}
                  disabled={deletingId === log.id}
                  title="Eliminar registro"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {deletingId === log.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Prompt (Instrucción)</span>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">"{log.prompt}"</p>
              </div>

              <div className="bg-indigo-50/40 p-4 rounded-lg border border-indigo-100">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">Respuesta de la IA</span>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{log.aiResponse}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">Trazabilidad / Uso en el texto</span>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{log.usage}</p>
              </div>
            </div>
          </div>
        ))}
        {(logs || []).length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            No hay registros de IA guardados. ¡Consulta a Gemini en vivo o añade tu primer registro manual!
          </div>
        )}
      </div>

      {/* Modal Interactivo para Consultar Gemini API en Vivo */}
      {isGeminiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-indigo-900 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-lg font-semibold">Consultar Gemini IA (Asistente en Vivo)</h3>
              </div>
              <button onClick={() => setIsGeminiModalOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {geminiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <span>{geminiError}</span>
                </div>
              )}

              <form id="gemini-form" onSubmit={handleGeminiSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Instrucción / Prompt para Gemini
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Ej. Redacta 3 párrafos sobre la importancia de la trazabilidad en proyectos de grado..."
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ¿Cómo usarás esta información en tu documento? (Opcional)
                  </label>
                  <textarea
                    rows="2"
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Ej. Adaptaré la estructura sugerida para el capítulo de Justificación..."
                    value={geminiUsage}
                    onChange={(e) => setGeminiUsage(e.target.value)}
                  ></textarea>
                </div>
              </form>

              {geminiResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      ✓ Registrado Automáticamente en la Bitácora
                    </span>
                    <span className="text-xs text-emerald-600">{geminiResult.date}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-emerald-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Respuesta de Gemini:</p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{geminiResult.aiResponse}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGeminiModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                form="gemini-form"
                disabled={geminiQuerying}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                {geminiQuerying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando con Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generar Respuesta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Registro Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalMode === 'add' ? 'Registrar Interacción Manual con IA' : 'Editar Registro de IA'}
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
              <form id="ai-log-form" onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Herramienta Utilizada</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    value={formData.tool}
                    onChange={(e) => setFormData({...formData, tool: e.target.value})}
                  >
                    <option value="Gemini">Gemini</option>
                    <option value="ChatGPT">ChatGPT</option>
                    <option value="Claude">Claude</option>
                    <option value="Copilot">Copilot</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prompt (Lo que le pediste)</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Ej: Redacta un párrafo sobre la importancia de la ciberseguridad..."
                    value={formData.prompt}
                    onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Respuesta exacta de la IA</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Pega aquí el resultado crudo que obtuviste..."
                    value={formData.aiResponse}
                    onChange={(e) => setFormData({...formData, aiResponse: e.target.value})}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">¿Cómo lo usaste en tu documento?</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Ej: Utilicé el concepto central para definir el problema en la página 15, ajustando el tono."
                    value={formData.usage}
                    onChange={(e) => setFormData({...formData, usage: e.target.value})}
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="ai-log-form"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === 'add' ? 'Guardar Registro' : 'Actualizar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
