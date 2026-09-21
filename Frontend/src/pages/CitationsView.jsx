import { useState } from 'react';
import { Upload, PlusCircle, Search, BookMarked, Pencil, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import { useCitationFilters } from '../hooks/useCitationFilters';
import ImportCitationModal from './ImportCitationModal';
import CitationFormModal from './CitationFormModal';

// -- VISTA: DOCUMENTOS A CITAR (ESTILO IEEE) --
export default function CitationsView({ citations, queries, onAddCitation, onUpdateCitation, onDeleteCitation, onImportBatch }) {
  const {
    searchTerm, setSearchTerm,
    selectedSection, setSelectedSection,
    selectedSource, setSelectedSource,
    filteredCitations,
    sectionsList
  } = useCitationFilters(citations);
  const [copiedId, setCopiedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCitation, setEditingCitation] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Copiado rápido de referencia IEEE
  const handleCopyIEEE = (id, refText) => {
    navigator.clipboard.writeText(refText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sourcesList = ["Scopus", "Web of Science", "IEEE Xplore", "PubMed", "Google Scholar", "Otro"];

  return (
    <div className="space-y-6">
      {/* Encabezado y acciones principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Documentos a Citar (Estilo IEEE)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona las referencias bibliográficas que sustentan tu documento de grado, vinculadas a tus ecuaciones de búsqueda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" /> Importar BibTeX / RIS
          </button>
          <button
            onClick={() => { setEditingCitation(null); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Agregar Manual
          </button>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor, IEEE o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Sección:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="todas">Todas las secciones</option>
              {sectionsList.map((sec, idx) => (
                <option key={idx} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Origen:</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="todas">Todas las bases de datos</option>
              {sourcesList.map((src, idx) => (
                <option key={idx} value={src}>{src}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de citaciones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCitations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No se encontraron documentos a citar</h3>
            <p className="text-sm text-slate-500 mt-1">Importa tu archivo .bib/.ris o agrega referencias manualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">N.º IEEE</th>
                  <th className="py-3 px-4 min-w-[320px]">Referencia IEEE Formateada</th>
                  <th className="py-3 px-4">Origen / Ecuación</th>
                  <th className="py-3 px-4">Sección del Proyecto</th>
                  <th className="py-3 px-4 min-w-[200px]">Notas / Citas Textuales</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredCitations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-indigo-700 bg-indigo-50/50 border-r border-slate-100">
                      [{item.ieeeNumber || item.id}]
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900 leading-relaxed">
                        {item.ieeeReference}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <button
                          onClick={() => handleCopyIEEE(item.id, item.ieeeReference)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                            copiedId === item.id
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === item.id ? '¡Copiado IEEE!' : 'Copiar Referencia IEEE'}
                        </button>
                        {item.doi && (
                          <a
                            href={`https://doi.org/${item.doi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                          >
                            DOI: {item.doi} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <span className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-slate-200">
                        {item.sourceDb || 'Otro'}
                      </span>
                      {item.queryTitle ? (
                        <p className="text-xs text-indigo-600 font-medium truncate max-w-[160px]" title={item.queryTitle}>
                          🔗 {item.queryTitle}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Sin ecuación vinculada</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium px-2.5 py-1 rounded-full">
                        {item.section || 'Marco Teórico'}
                      </span>
                    </td>
                    <td className="py-4 px-4 space-y-1 text-xs">
                      {item.notes && (
                        <p className="text-slate-700"><strong className="text-slate-900">Nota:</strong> {item.notes}</p>
                      )}
                      {item.quotes && (
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-600 italic">
                          "{item.quotes}"
                        </div>
                      )}
                      {!item.notes && !item.quotes && (
                        <span className="text-slate-400 italic">Sin notas registradas</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => { setEditingCitation(item); setShowAddModal(true); }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar citación"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la referencia [${item.ieeeNumber}] "${item.title}"?`)) {
                            onDeleteCitation(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar citación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Importación BibTeX/RIS */}
      {showImportModal && (
        <ImportCitationModal
          queries={queries}
          onClose={() => setShowImportModal(false)}
          onImportConfirm={async (batchItems) => {
            await onImportBatch(batchItems);
            setShowImportModal(false);
          }}
        />
      )}

      {/* Modal de Crear / Editar Citación */}
      {showAddModal && (
        <CitationFormModal
          citation={editingCitation}
          queries={queries}
          onClose={() => { setShowAddModal(false); setEditingCitation(null); }}
          onSave={async (data) => {
            if (editingCitation) {
              await onUpdateCitation({ ...data, id: editingCitation.id });
            } else {
              await onAddCitation(data);
            }
            setShowAddModal(false);
            setEditingCitation(null);
          }}
        />
      )}
    </div>
  );
}
