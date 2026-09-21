import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import {
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
  saveBatchCitations
} from './api';
import { renumberIeeeCitations } from './utils/citations';
import Sidebar from './components/Sidebar';
import LoginView from './pages/LoginView';
import DashboardView from './pages/DashboardView';
import PhasesView from './pages/PhasesView';
import AILogsView from './pages/AILogsView';
import QueriesView from './pages/QueriesView';
import ResourcesView from './pages/ResourcesView';
import CitationsView from './pages/CitationsView';

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
      setCitations(prev => renumberIeeeCitations(prev.filter(c => c.id !== id)));
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
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        username={username}
        onLogout={handleLogout}
      />

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
          <div className={`mx-auto ${activeTab === 'citaciones' ? 'max-w-full' : 'max-w-5xl'}`}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
