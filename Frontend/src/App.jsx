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
  Send
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
  deleteResource
} from './api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [phases, setPhases] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos desde la API al estar autenticado
  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [phasesData, logsData, resourcesData] = await Promise.all([
        getPhases(),
        getAiLogs(),
        getResources()
      ]);
      setPhases(phasesData);
      setAiLogs(logsData);
      setResources(resourcesData);
    } catch (err) {
      console.error("Error al cargar datos de la API:", err);
      if (err.message.includes("401") || err.message.toLowerCase().includes("no autorizado")) {
        setIsAuthenticated(false);
      } else {
        setError("No se pudo conectar con el servidor Backend (FastAPI). Verifica que esté en ejecución en http://localhost:8000.");
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
        return <DashboardView phases={phases} aiLogs={aiLogs} />;
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
        return <DashboardView phases={phases} aiLogs={aiLogs} />;
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

function DashboardView({ phases, aiLogs }) {
  const completed = phases.filter(p => p.status === 'completado').length;
  const progress = phases.length === 0 ? 0 : Math.round((completed / phases.length) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <span className="text-sm text-slate-500">de {phases.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Consultas IA Registradas</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-600">{aiLogs.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Última consulta: {aiLogs[0]?.date || 'Ninguna'}</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">¡Bienvenido a tu entorno de trazabilidad!</h3>
        <p className="text-indigo-700 text-sm">
          Aquí podrás registrar cada paso de tu proyecto de grado. Usa el menú lateral para actualizar el estado de tus fases o registrar cómo estás utilizando herramientas de IA en tu redacción.
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
        {phases.map((phase) => (
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
                  Estado: {phase.status.replace('_', ' ')} • Fecha: {phase.date}
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
        {phases.length === 0 && (
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
        {logs.map((log) => (
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
        {logs.length === 0 && (
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
    switch (type) {
      case 'Scholar': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'Drive': return <Folder className="w-5 h-5 text-emerald-500" />;
      case 'PDF': return <File className="w-5 h-5 text-red-500" />;
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
        {resources.map((resource) => (
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
        {resources.length === 0 && (
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
