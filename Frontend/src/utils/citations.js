// Reasigna ieeeNumber de forma secuencial (1..N) tras eliminar una citación,
// reflejando en el cliente lo que el backend hace en reindex_ieee_numbers.
export function renumberIeeeCitations(citations) {
  return citations.map((c, idx) => ({ ...c, ieeeNumber: idx + 1 }));
}

export function buildBatchPayload(previewItems, selectedIndices, defaults) {
  const { defaultSourceDb, defaultQueryId, defaultSection } = defaults;
  return selectedIndices.map(idx => ({
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
}
