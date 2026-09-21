import { Home, ListTodo, Bot, Link as LinkIcon, Search, BookMarked, LogOut, FileText } from 'lucide-react';
import NavItem from './NavItem';

export default function Sidebar({ activeTab, onTabChange, username, onLogout }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Trazabilidad UI
        </h1>
        <p className="text-xs text-slate-500 mt-1">Proyecto de Grado</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem icon={<Home />} label="Resumen" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <NavItem icon={<ListTodo />} label="Fases del Proyecto" active={activeTab === 'fases'} onClick={() => onTabChange('fases')} />
        <NavItem icon={<Bot />} label="Bitácora de IA" active={activeTab === 'bitacora-ia'} onClick={() => onTabChange('bitacora-ia')} />
        <NavItem icon={<Search />} label="Ecuaciones de Búsqueda" active={activeTab === 'ecuaciones'} onClick={() => onTabChange('ecuaciones')} />
        <NavItem icon={<BookMarked />} label="Documentos a Citar" active={activeTab === 'citaciones'} onClick={() => onTabChange('citaciones')} />
        <NavItem icon={<LinkIcon />} label="Recursos y Enlaces" active={activeTab === 'recursos'} onClick={() => onTabChange('recursos')} />
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
          onClick={onLogout}
          title="Cerrar Sesión"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
