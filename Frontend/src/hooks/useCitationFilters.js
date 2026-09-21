import { useState } from 'react';

export function useCitationFilters(citations) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('todas');
  const [selectedSource, setSelectedSource] = useState('todas');

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

  return {
    searchTerm, setSearchTerm,
    selectedSection, setSelectedSection,
    selectedSource, setSelectedSource,
    filteredCitations,
    sectionsList
  };
}
