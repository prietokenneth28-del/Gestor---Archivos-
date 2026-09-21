import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ListTodo, 
  Bot, 
  Link as LinkIcon, 
  PlusCircle, 
  CheckCircle2, 
  Circle,
  FileText,
  X,
  ExternalLink,
  BookOpen,
  Folder,
  File,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  LogOut,
  Lock,
  User,
  Sparkles,
  Send,
  Search,
  Copy,
  Check,
  Database,
  BookMarked,
  Upload,
  Quote
} from 'lucide-react';
import { 
  loginUser,
  askGemini,
  getPhases, 
  createPhase, 
  updatePhase, 
  getAiLogs, 
  createAiLog, 
  updateAiLog,
  deleteAiLog,
  getResources, 
  createResource,
  updateResource,
  deleteResource,
  getQueries,
  createQuery,
  updateQuery,
  deleteQuery,
  getCitations,
  createCitation,
  updateCitation,
  deleteCitation,
  importCitationsPreview,
  saveBatchCitations
} from './api';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [phases, setPhases] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [resources, setResources] = useState([]);
  const [queries, setQueries] = useState([]);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos desde la API al estar autenticado
  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [phasesData, logsData, resourcesData, queriesData, citationsData] = await Promise.all([
        getPhases().catch(err => { console.error("Error al cargar fases:", err); return []; }),
        getAiLogs().catch(err => { console.error("Error al cargar bitácora IA:", err); return []; }),
        getResources().catch(err => { console.error("Error al cargar recursos:", err); return []; }),
        getQueries().catch(err => { console.error("Error al cargar ecuaciones:", err); return []; }),
        getCitations().catch(err => { console.error("Error al cargar citaciones:", err); return []; })
      ]);
      setPhases(phasesData || []);
      setAiLogs(logsData || []);
      setResources(resourcesData || []);
      setQueries(queriesData || []);
      setCitations(citationsData || []);
    } catch (err) {
      console.error("Error al cargar datos de la API:", err);
      if (err.message.includes("401") || err.message.toLowerCase().includes("no autorizado")) {
        setIsAuthenticated(false);
      } else {
        setError("No se pudo conectar con el servidor Backend (FastAPI). Verifica que esté en ejecución.");
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    setIsAuthenticated(false);
    setPhases([]);
    setAiLogs([]);
    setResources([]);
    setQueries([]);
    setCitations([]);
  };

  // Manejadores de eventos asíncronos - Fases
  const handleAddPhase = async (phaseData) => {
    try {
      const created = await createPhase(phaseData);
      setPhases(prev => [...prev, created]);
    } catch (err) {
      alert("Error al guardar la fase: " + err.message);
    }
  };

  const handleUpdatePhase = async (phaseData) => {
    try {
      const updated = await updatePhase(phaseData.id, phaseData);
      setPhases(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      alert("Error al actualizar la fase: " + err.message);
    }
  };

  // Manejadores de eventos asíncronos - Bitácora IA
  const handleAddLog = async (logData) => {
    try {
      const created = await createAiLog(logData);
      setAiLogs(prev => [created, ...prev]);
    } catch (err) {
      alert("Error al guardar el registro de IA: " + err.message);
    }
  };

  const handleGeminiQuery = async (prompt, usage) => {
    const created = await askGemini(prompt, usage);
    setAiLogs(prev => [created, ...prev]);
    return created;
  };

  const handleUpdateLog = async (logData) => {
    try {
      const updated = await updateAiLog(logData.id, logData);
      setAiLogs(prev => prev.map(log => log.id === updated.id ? updated : log));
    } catch (err) {
      alert("Error al actualizar el registro de IA: " + err.message);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await deleteAiLog(id);
      setAiLogs(prev => prev.filter(log => log.id !== id));
    } catch (err) {
      alert("Error al eliminar el registro de IA: " + err.message);
    }
  };

  // Manejadores de eventos asíncronos - Recursos
  const handleAddResource = async (resData) => {
    try {
      const created = await createResource(resData);
      setResources(prev => [created, ...prev]);
    } catch (err) {
      alert("Error al guardar el recurso: " + err.message);
    }
  };

  const handleUpdateResource = async (resData) => {
    try {
      const updated = await updateResource(resData.id, resData);
      setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch (err) {
      alert("Error al actualizar el recurso: " + err.message);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Error al eliminar el recurso: " + err.message);
    }
  };

  // Manejadores de eventos asíncronos - Ecuaciones de Búsqueda
  const handleAddQuery = async (queryData) => {
    try {
      const created = await createQuery(queryData);
      setQueries(prev => [created, ...prev]);
    } catch (err) {
      alert("Error al guardar la ecuación de búsqueda: " + err.message);
    }
  };

  const handleUpdateQuery = async (queryData) => {
    try {
      const updated = await updateQuery(queryData.id, queryData);
      setQueries(prev => prev.map(q => q.id === updated.id ? updated : q));
    } catch (err) {
      alert("Error al actualizar la ecuación de búsqueda: " + err.message);
    }
  };

  const handleDeleteQuery = async (id) => {
    try {
      await deleteQuery(id);
      setQueries(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert("Error al eliminar la ecuación de búsqueda: " + err.message);
    }
  };

  // Manejadores de eventos asíncronos - Citaciones (Documentos a Citar)
  const handleAddCitation = async (citationData) => {
    try {
      const created = await createCitation(citationData);
      setCitations(prev => [...prev, created]);
    } catch (err) {
      alert("Error al guardar la citación: " + err.message);
    }
  };

  const handleUpdateCitation = async (citationData) => {
    try {
      const updated = await updateCitation(citationData.id, citationData);
      setCitations(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (err) {
      alert("Error al actualizar la citación: " + err.message);
    }
  };

  const handleDeleteCitation = async (id) => {
    try {
      await deleteCitation(id);
      setCitations(prev => {
        const filtered = prev.filter(c => c.id !== id);
        return filtered.map((c, idx) => ({ ...c, ieeeNumber: idx + 1 }));
      });
    } catch (err) {
      alert("Error al eliminar la citación: " + err.message);
    }
  };

  const handleImportBatchCitations = async (items) => {
    try {
      const createdList = await saveBatchCitations(items);
      setCitations(prev => [...prev, ...createdList]);
    } catch (err) {
      alert("Error al importar el lote de citaciones: " + err.message);
    }
  };

  // Si no está autenticado, renderizar la pantalla de Login
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Cargando datos desde la API...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-800 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Error de Conexión</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={loadData}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar Conexión
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView phases={phases} aiLogs={aiLogs} queries={queries} citations={citations} />;
      case 'fases':
        return (
          <PhasesView 
            phases={phases} 
            onAddPhase={handleAddPhase}
            onUpdatePhase={handleUpdatePhase}
          />
        );
      case 'bitacora-ia':
        return (
          <AILogsView 
            logs={aiLogs} 
            onAddLog={handleAddLog} 
            onGeminiQuery={handleGeminiQuery}
            onUpdateLog={handleUpdateLog}
            onDeleteLog={handleDeleteLog}
          />
        );
      case 'ecuaciones':
        return (
          <QueriesView 
            queries={queries}
            onAddQuery={handleAddQuery}
            onUpdateQuery={handleUpdateQuery}
            onDeleteQuery={handleDeleteQuery}
          />
        );
      case 'citaciones':
        return (
          <CitationsView 
            citations={citations}
            queries={queries}
            onAddCitation={handleAddCitation}
            onUpdateCitation={handleUpdateCitation}
            onDeleteCitation={handleDeleteCitation}
            onImportBatch={handleImportBatchCitations}
          />
        );
      case 'recursos':
        return (
          <ResourcesView 
            resources={resources} 
            onAddResource={handleAddResource} 
            onUpdateResource={handleUpdateResource}
            onDeleteResource={handleDeleteResource}
          />
        );
      default:
        return <DashboardView phases={phases} aiLogs={aiLogs} queries={queries} citations={citations} />;
    }
  };

  const username = localStorage.getItem('auth_username') || 'Equipo Alpha';

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar (Barra lateral) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Trazabilidad UI
          </h1>
          <p className="text-xs text-slate-500 mt-1">Proyecto de Grado</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<Home />} label="Resumen" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<ListTodo />} label="Fases del Proyecto" active={activeTab === 'fases'} onClick={() => setActiveTab('fases')} />
          <NavItem icon={<Bot />} label="Bitácora de IA" active={activeTab === 'bitacora-ia'} onClick={() => setActiveTab('bitacora-ia')} />
          <NavItem icon={<Search />} label="Ecuaciones de Búsqueda" active={activeTab === 'ecuaciones'} onClick={() => setActiveTab('ecuaciones')} />
          <NavItem icon={<BookMarked />} label="Documentos a Citar" active={activeTab === 'citaciones'} onClick={() => setActiveTab('citaciones')} />
          <NavItem icon={<LinkIcon />} label="Recursos y Enlaces" active={activeTab === 'recursos'} onClick={() => setActiveTab('recursos')} />
        </nav>


        <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-sm truncate">
              <p className="font-medium truncate">{username}</p>
              <p className="text-xs text-slate-500">Sesión Activa</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content (Contenido Principal) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center z-10 shrink-0">
          <h2 className="text-2xl font-semibold capitalize text-slate-800">
            {activeTab.replace('-', ' ')}
          </h2>
          <button 
            onClick={loadData}
            title="Recargar datos desde la API"
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-indigo-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar API
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// Vista: Pantalla de Login
function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginUser(username, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Herramienta de Trazabilidad</h1>
          <p className="text-sm text-slate-500 mt-1">Iniciar sesión en el Proyecto de Grado</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          Acceso protegido por credenciales de equipo
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      {label}
    </button>
  );
}

function DashboardView({ phases, aiLogs, queries, citations }) {
  const completed = (phases || []).filter(p => p.status === 'completado').length;
  const progress = (phases || []).length === 0 ? 0 : Math.round((completed / (phases || []).length) * 100);

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


function PhasesView({ phases, onAddPhase, onUpdatePhase }) {
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

function AILogsView({ logs, onAddLog, onGeminiQuery, onUpdateLog, onDeleteLog }) {
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

// Vista: Ecuaciones de Búsqueda Avanzada (Advanced Queries)
function QueriesView({ queries, onAddQuery, onUpdateQuery, onDeleteQuery }) {
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
    setFormData({
      id: q.id,
      title: q.title || '',
      databaseName: q.databaseName || q.database_name || 'Scopus',
      queryText: q.queryText || q.query_text || '',
      description: q.description || '',
      resultsCount: q.resultsCount !== undefined ? q.resultsCount : (q.results_count !== undefined ? q.results_count : 0)
    });
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

  const getDbBadgeClass = (dbName) => {
    switch ((dbName || '').toLowerCase()) {
      case 'scopus': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'web of science': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ieee xplore': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pubmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'google scholar': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
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
          const dbName = q.databaseName || q.database_name || 'Scopus';
          const text = q.queryText || q.query_text || '';
          const count = q.resultsCount !== undefined ? q.resultsCount : (q.results_count !== undefined ? q.results_count : 0);
          const qDate = q.date || q.created_date || '-';

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

function ResourcesView({ resources, onAddResource, onUpdateResource, onDeleteResource }) {
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

  const getIconForType = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'scholar': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'drive': return <Folder className="w-5 h-5 text-emerald-500" />;
      case 'pdf': return <File className="w-5 h-5 text-red-500" />;
      default: return <ExternalLink className="w-5 h-5 text-slate-500" />;
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



// -- VISTA: DOCUMENTOS A CITAR (ESTILO IEEE) --
function CitationsView({ citations, queries, onAddCitation, onUpdateCitation, onDeleteCitation, onImportBatch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('todas');
  const [selectedSource, setSelectedSource] = useState('todas');
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

  // Filtrado de la tabla
  const filteredCitations = (citations || []).filter(c => {
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.authors || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.ieeeReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = selectedSection === 'todas' || (c.section || 'Marco Teórico') === selectedSection;
    const matchesSource = selectedSource === 'todas' || (c.sourceDb || 'Otro') === selectedSource;
    
    return matchesSearch && matchesSection && matchesSource;
  });

  const sectionsList = Array.from(new Set((citations || []).map(c => c.section || 'Marco Teórico')));
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
                          if (confirm(`¿Eliminar la referencia [${item.ieeeNumber}] "${item.title}"?`)) {
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

// Componente Modal de Importación BibTeX / RIS
function ImportCitationModal({ queries, onClose, onImportConfirm }) {
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
    const toSave = selectedIndices.map(idx => ({
      entryType: previewItems[idx].entryType,
      citeKey: previewItems[idx].citeKey,
      authors: previewItems[idx].authors,
      title: previewItems[idx].title,
      year: previewItems[idx].year,
      publication: previewItems[idx].publication,
      volume: previewItems[idx].volume,
      issue: previewItems[idx].issue,
      pages: previewItems[idx].pages,
      publisher: previewItems[idx].publisher,
      doi: previewItems[idx].doi,
      url: previewItems[idx].url,
      sourceDb: previewItems[idx].sourceDb || defaultSourceDb,
      queryId: previewItems[idx].queryId ? parseInt(previewItems[idx].queryId, 10) : (defaultQueryId ? parseInt(defaultQueryId, 10) : null),
      section: previewItems[idx].section || defaultSection,
      notes: previewItems[idx].notes,
      quotes: previewItems[idx].quotes
    }));
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

// Componente Modal de Crear / Editar Citación
function CitationFormModal({ citation, queries, onClose, onSave }) {
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

