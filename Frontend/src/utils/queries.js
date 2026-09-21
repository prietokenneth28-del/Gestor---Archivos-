export function normalizeQuery(q) {
  return {
    id: q.id,
    title: q.title || '',
    databaseName: q.databaseName || q.database_name || 'Scopus',
    queryText: q.queryText || q.query_text || '',
    description: q.description || '',
    resultsCount: q.resultsCount !== undefined ? q.resultsCount : (q.results_count !== undefined ? q.results_count : 0),
    date: q.date || q.created_date || '-'
  };
}

export function getDbBadgeClass(dbName) {
  switch ((dbName || '').toLowerCase()) {
    case 'scopus': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'web of science': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'ieee xplore': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pubmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'google scholar': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}
