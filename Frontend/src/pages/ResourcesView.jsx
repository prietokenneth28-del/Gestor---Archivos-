import { useState } from 'react';
import { PlusCircle, ExternalLink, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { getIconForType } from '../utils/resources.jsx';

export default function ResourcesView({ resources, onAddResource, onUpdateResource, onDeleteResource }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({ id: null, title: '', url: '', type: 'Otro', description: '' });

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ id: null, title: '', url: '', type: 'Otro', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (resource) => {
    setModalMode('edit');
    setFormData({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      type: resource.type,
      description: resource.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await onAddResource({
          title: formData.title,
          url: formData.url,
          type: formData.type,
          description: formData.description
        });
      } else {
        await onUpdateResource(formData);
      }
      setIsModalOpen(false);
      setFormData({ id: null, title: '', url: '', type: 'Otro', description: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este recurso o enlace bibliográfico?")) {
      setDeletingId(id);
      try {
        await onDeleteResource(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Repositorio de Recursos</h3>
          <p className="text-sm text-slate-500">Gestiona los enlaces, bibliografía y documentos de la nube.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Añadir Enlace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(resources || []).map((resource) => (
          <div key={resource.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    {getIconForType(resource.type)}
                  </div>
                  <h4 className="font-semibold text-slate-800 line-clamp-2">{resource.title}</h4>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(resource)}
                    title="Editar recurso"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    disabled={deletingId === resource.id}
                    title="Eliminar recurso"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deletingId === resource.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{resource.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">{resource.type} • {resource.date}</span>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Visitar <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
        {(resources || []).length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            No hay recursos registrados. ¡Añade tu primer enlace bibliográfico!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalMode === 'add' ? 'Añadir Nuevo Recurso' : 'Editar Recurso'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form id="resource-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título del Recurso</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="Ej: Carpeta de Anexos"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enlace (URL)</label>
                  <input
                    type="url"
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Recurso</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Scholar">Google Scholar / Artículo</option>
                    <option value="PDF">Documento PDF</option>
                    <option value="Drive">Google Drive / Nube</option>
                    <option value="Otro">Otro Enlace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Breve Descripción (Opcional)</label>
                  <textarea
                    rows="2"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    placeholder="¿Para qué sirve este enlace en el proyecto?"
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
                form="resource-form"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === 'add' ? 'Guardar Recurso' : 'Actualizar Recurso'}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
