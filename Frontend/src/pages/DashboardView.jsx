import { calculateProgress } from '../utils/progress';

export default function DashboardView({ phases, aiLogs, queries, citations }) {
  const { completed, progress } = calculateProgress(phases);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Progreso del Proyecto</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Fases Completadas</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{completed}</span>
            <span className="text-sm text-slate-500">de {(phases || []).length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Consultas IA Registradas</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-600">{(aiLogs || []).length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Última: {(aiLogs || [])[0]?.date || 'Ninguna'}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Ecuaciones de Búsqueda</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{(queries || []).length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Scopus, WoS, IEEE</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Documentos a Citar</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">{(citations || []).length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Formato IEEE [1], [2]...</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">¡Bienvenido a tu entorno de trazabilidad!</h3>
        <p className="text-indigo-700 text-sm">
          Aquí podrás registrar cada paso de tu proyecto de grado. Usa el menú lateral para actualizar tus fases, generar consultas con Gemini IA, almacenar tus ecuaciones de búsqueda, gestionar tus referencias en norma IEEE e importar tus archivos BibTeX / RIS.
        </p>
      </div>
    </div>
  );
}
