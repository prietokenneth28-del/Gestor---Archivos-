import { useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { importCitationsPreview } from '../api';
import { buildBatchPayload } from '../utils/citations';

// Componente Modal de Importación BibTeX / RIS
export default function ImportCitationModal({ queries, onClose, onImportConfirm }) {
  const [importMode, setImportMode] = useState('paste'); // 'paste' | 'file'
  const [rawText, setRawText] = useState('');
  const [format, setFormat] = useState('auto');
  const [defaultSourceDb, setDefaultSourceDb] = useState('Scopus');
  const [defaultQueryId, setDefaultQueryId] = useState('');
  const [defaultSection, setDefaultSection] = useState('Marco Teórico');

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewItems, setPreviewItems] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handlePreview = async () => {
    if (!rawText.trim()) {
      alert("Ingresa o sube un texto en formato BibTeX o RIS");
      return;
    }
    setLoadingPreview(true);
    setError(null);
    try {
      const items = await importCitationsPreview(rawText, {
        format,
        defaultSourceDb,
        defaultQueryId,
        defaultSection
      });
      setPreviewItems(items);
      const nonDups = items.map((it, idx) => (!it.isDuplicate ? idx : null)).filter(idx => idx !== null);
      setSelectedIndices(nonDups);
    } catch (err) {
      setError("Error al procesar el archivo: " + err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSaveSelected = async () => {
    if (selectedIndices.length === 0) {
      alert("Selecciona al menos una citación para importar");
      return;
    }
    const toSave = buildBatchPayload(previewItems, selectedIndices, { defaultSourceDb, defaultQueryId, defaultSection });
    await onImportConfirm(toSave);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden my-8">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Importar Bibliografía (BibTeX / RIS)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {!previewItems ? (
            <>
              <div className="flex border-b border-slate-200 text-sm font-medium">
                <button
                  onClick={() => setImportMode('paste')}
                  className={`py-2 px-4 border-b-2 font-medium ${importMode === 'paste' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Pegar Texto BibTeX / RIS
                </button>
                <button
                  onClick={() => setImportMode('file')}
                  className={`py-2 px-4 border-b-2 font-medium ${importMode === 'file' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Subir Archivo (.bib / .ris)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Base de Datos Origen</label>
                  <select
                    value={defaultSourceDb}
                    onChange={(e) => setDefaultSourceDb(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
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
                  <label className="block font-medium text-slate-700 mb-1">Ecuación Vinculada</label>
                  <select
                    value={defaultQueryId}
                    onChange={(e) => setDefaultQueryId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="">(Ninguna)</option>
                    {(queries || []).map(q => (
                      <option key={q.id} value={q.id}>{q.title} ({q.databaseName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sección de Cita</label>
                  <select
                    value={defaultSection}
                    onChange={(e) => setDefaultSection(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Marco Teórico">Marco Teórico</option>
                    <option value="Estado del Arte">Estado del Arte</option>
                    <option value="Introducción">Introducción</option>
                    <option value="Diseño Metodológico">Diseño Metodológico</option>
                    <option value="Resultados y Discusión">Resultados y Discusión</option>
                  </select>
                </div>
              </div>

              {importMode === 'paste' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pega el texto formateado:</label>
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`@article{Smith2025,\n  author = {Smith, John and Johnson, Alice},\n  title = {Automated Requirement Traceability},\n  journal = {IEEE TSE},\n  year = {2025}\n}`}
                    className="w-full font-mono text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Selecciona un archivo .bib o .ris:</label>
                  <input
                    type="file"
                    accept=".bib,.ris,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {rawText && (
                    <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 font-medium">Vista previa del archivo cargado ({rawText.length} caracteres):</p>
                      <pre className="text-xs font-mono text-slate-500 max-h-32 overflow-y-auto mt-1 whitespace-pre-wrap">{rawText.substring(0, 500)}...</pre>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handlePreview}
                disabled={loadingPreview || !rawText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              >
                {loadingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Previsualizar y Parsear Entradas'}
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm">Entradas Parseadas ({previewItems.length})</h4>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Selecciona los documentos que deseas agregar a tu biblioteca.
                  </p>
                </div>
                <button
                  onClick={() => setPreviewItems(null)}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  ← Cambiar texto / archivo
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {previewItems.map((item, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.isDuplicate
                          ? 'bg-amber-50/50 border-amber-200'
                          : isChecked
                            ? 'bg-white border-indigo-300 shadow-sm'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIndices(prev => [...prev, idx]);
                            } else {
                              setSelectedIndices(prev => prev.filter(i => i !== idx));
                            }
                          }}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-slate-500">{item.entryType}</span>
                            {item.isDuplicate && (
                              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {item.duplicateReason}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">{item.title}</p>
                          <p className="text-xs text-slate-600">{item.authors} ({item.year})</p>
                          <div className="bg-slate-100 p-2 rounded text-xs font-mono text-slate-700 mt-2">
                            IEEE: {item.ieeeReference}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500 font-medium">
                  {selectedIndices.length} de {previewItems.length} seleccionados
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveSelected}
                    disabled={selectedIndices.length === 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                  >
                    Confirmar e Importar ({selectedIndices.length})
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
