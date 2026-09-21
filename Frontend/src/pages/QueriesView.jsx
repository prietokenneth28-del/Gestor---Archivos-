import { useState } from 'react';
import { PlusCircle, Pencil, Trash2, Loader2, X, Copy, Check } from 'lucide-react';
import { normalizeQuery, getDbBadgeClass } from '../utils/queries';

export default function QueriesView({ queries, onAddQuery, onUpdateQuery, onDeleteQuery }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    databaseName: 'Scopus',
    queryText: '',
    description: '',
    resultsCount: 0
  });

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ id: null, title: '', databaseName: 'Scopus', queryText: '', description: '', resultsCount: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setModalMode('edit');
    setFormData(normalizeQuery(q));
    setIsModalOpen(true);
  };

  const handleCopy = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await onAddQuery({
          title: formData.title,
          databaseName: formData.databaseName,
          queryText: formData.queryText,
          description: formData.description,
          resultsCount: parseInt(formData.resultsCount, 10) || 0
        });
      } else {
        await onUpdateQuery({
          ...formData,
          resultsCount: parseInt(formData.resultsCount, 10) || 0
        });
      }
      setIsModalOpen(false);
      setFormData({ id: null, title: '', databaseName: 'Scopus', queryText: '', description: '', resultsCount: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta ecuación de búsqueda?")) {
      setDeletingId(id);
      try {
        await onDeleteQuery(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const safeQueries = queries || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Ecuaciones de Búsqueda Avanzada</h3>
          <p className="text-sm text-slate-500">Almacena, organiza y copia rápidamente tus sintaxis de búsqueda para Scopus y otras bases académicas.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Ecuación
        </button>
      </div>

      <div className="space-y-6">
        {safeQueries.map((q) => {
          const { databaseName: dbName, queryText: text, resultsCount: count, date: qDate } = normalizeQuery(q);

          return (
            <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getDbBadgeClass(dbName)}`}>
                    {dbName}
                  </span>
                  <h4 className="font-semibold text-slate-800 text-base">{q.title}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(q)}
                    title="Editar ecuación"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={deletingId === q.id}
                    title="Eliminar ecuación"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deletingId === q.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Caja de Código para la Sintaxis con Botón Copiar */}
              <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl relative group border border-slate-800 overflow-x-auto">
                <div className="flex justify-between items-start gap-4">
                  <pre className="whitespace-pre-wrap break-words leading-relaxed font-mono flex-1">
                    {text}
                  </pre>
                  <button
                    onClick={() => handleCopy(q.id, text)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm ${
                      copiedId === q.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {copiedId === q.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Ecuación</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <p className="text-slate-600 font-medium">{q.description}</p>
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">
                    📊 {count} resultados
                  </span>
                  <span>Registrado: {qDate}</span>
                </div>
              </div>
            </div>
          );
        })}
        {safeQueries.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            No hay ecuaciones de búsqueda guardadas. ¡Añade tu primera cadena de búsqueda para Scopus!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalMode === 'add' ? 'Guardar Nueva Ecuación de Búsqueda' : 'Editar Ecuación de Búsqueda'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
              <form id="query-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título / Objetivo de la Búsqueda</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Ej: Búsqueda de Trazabilidad e Inteligencia Artificial"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Base de Datos</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      value={formData.databaseName}
                      onChange={(e) => setFormData({...formData, databaseName: e.target.value})}
                    >
                      <option value="Scopus">Scopus</option>
                      <option value="Web of Science">Web of Science</option>
                      <option value="IEEE Xplore">IEEE Xplore</option>
                      <option value="PubMed">PubMed</option>
                      <option value="Google Scholar">Google Scholar</option>
                      <option value="Otra">Otra Base de Datos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resultados Obtenidos</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="Ej: 42"
                      value={formData.resultsCount}
                      onChange={(e) => setFormData({...formData, resultsCount: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sintaxis / Cadena de la Consulta (Query)</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder='Ej: TITLE-ABS-KEY(("traceability" OR "auditability") AND ("artificial intelligence"))'
                    value={formData.queryText}
                    onChange={(e) => setFormData({...formData, queryText: e.target.value})}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Justificación (Opcional)</label>
                  <textarea
                    rows="2"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="¿Para qué capítulo o estado del arte se utilizó esta cadena de búsqueda?"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
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
                form="query-form"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === 'add' ? 'Guardar Ecuación' : 'Actualizar Ecuación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
