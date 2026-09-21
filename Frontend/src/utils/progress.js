export function calculateProgress(phases) {
  const list = phases || [];
  const completed = list.filter(p => p.status === 'completado').length;
  const progress = list.length === 0 ? 0 : Math.round((completed / list.length) * 100);
  return { completed, progress, total: list.length };
}
