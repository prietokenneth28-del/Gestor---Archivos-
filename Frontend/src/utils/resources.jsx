import { BookOpen, Folder, File, ExternalLink } from 'lucide-react';

export function getIconForType(type) {
  switch ((type || '').toLowerCase()) {
    case 'scholar': return <BookOpen className="w-5 h-5 text-blue-500" />;
    case 'drive': return <Folder className="w-5 h-5 text-emerald-500" />;
    case 'pdf': return <File className="w-5 h-5 text-red-500" />;
    default: return <ExternalLink className="w-5 h-5 text-slate-500" />;
  }
}
