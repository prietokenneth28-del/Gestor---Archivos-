import { useState } from 'react';
import { X } from 'lucide-react';

// Componente Modal de Crear / Editar Citación
export default function CitationFormModal({ citation, queries, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: citation?.title || '',
    authors: citation?.authors || '',
    year: citation?.year || '',
    publication: citation?.publication || '',
    volume: citation?.volume || '',
    issue: citation?.issue || '',
    pages: citation?.pages || '',
    publisher: citation?.publisher || '',
    doi: citation?.doi || '',
    url: citation?.url || '',
    entryType: citation?.entryType || 'article',
    sourceDb: citation?.sourceDb || 'Scopus',
    queryId: citation?.queryId || '',
    section: citation?.section || 'Marco Teórico',
    notes: citation?.notes || '',
    quotes: citation?.quotes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("El título es obligatorio");
      return;
    }
    onSave({
      ...formData,
      queryId: formData.queryId ? parseInt(formData.queryId, 10) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {citation ? 'Editar Documento a Citar' : 'Agregar Documento a Citar'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título del Documento *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ej. Automated Requirement Traceability using Artificial Intelligence..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Autores</label>
              <input
                type="text"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. Smith, J. and Johnson, A."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="2025"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Publicación / Revista / Conf.</label>
              <input
                type="text"
                value={formData.publication}
                onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. IEEE Transactions on Software Engineering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Entrada</label>
              <select
                value={formData.entryType}
                onChange={(e) => setFormData({ ...formData, entryType: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
              >
                <option value="article">Artículo (Journal)</option>
                <option value="inproceedings">Conferencia (Proceedings)</option>
                <option value="book">Libro</option>
                <option value="misc">Web / General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Volumen</label>
              <input
                type="text"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                placeholder="51"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Número / Issue</label>
              <input
                type="text"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Páginas</label>
              <input
                type="text"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                placeholder="450-465"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DOI</label>
              <input
                type="text"
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                placeholder="10.1109/TSE.2025.1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                placeholder="https://doi.org/..."
              />
            </div>
          </div>

          <hr className="my-2 border-slate-200" />
          <h4 className="text-sm font-bold text-indigo-900">Aporte al Proyecto y Origen</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Base de Datos</label>
              <select
                value={formData.sourceDb}
                onChange={(e) => setFormData({ ...formData, sourceDb: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
              >
                <option value="Scopus">Scopus</option>
                <option value="Web of Science">Web of Science</option>
                <option value="IEEE Xplore">IEEE Xplore</option>
                <option value="PubMed">PubMed</option>
                <option value="Google Scholar">Google Scholar</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ecuación Vinculada</label>
              <select
                value={formData.queryId}
                onChange={(e) => setFormData({ ...formData, queryId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
              >
                <option value="">(Ninguna)</option>
                {(queries || []).map(q => (
                  <option key={q.id} value={q.id}>{q.title} ({q.databaseName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sección del Proyecto</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
              >
                <option value="Marco Teórico">Marco Teórico</option>
                <option value="Estado del Arte">Estado del Arte</option>
                <option value="Introducción">Introducción</option>
                <option value="Diseño Metodológico">Diseño Metodológico</option>
                <option value="Resultados y Discusión">Resultados y Discusión</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas / Justificación de Uso</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none"
              placeholder="¿Por qué se cita este documento en esta sección?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Citas Textuales y Números de Página</label>
            <textarea
              rows={2}
              value={formData.quotes}
              onChange={(e) => setFormData({ ...formData, quotes: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none"
              placeholder='Ej. "La trazabilidad automatizada reduce en un 40% los errores..." (p. 455)'
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm"
            >
              {citation ? 'Guardar Cambios' : 'Crear Citación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
