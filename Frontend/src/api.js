const API_BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
  }
  return response.json();
}

// -- FASES --
export async function getPhases() {
  const res = await fetch(`${API_BASE_URL}/phases`);
  return handleResponse(res);
}

export async function createPhase(phaseData) {
  const res = await fetch(`${API_BASE_URL}/phases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phaseData),
  });
  return handleResponse(res);
}

export async function updatePhase(id, phaseData) {
  const res = await fetch(`${API_BASE_URL}/phases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phaseData),
  });
  return handleResponse(res);
}

// -- BITÁCORA IA --
export async function getAiLogs() {
  const res = await fetch(`${API_BASE_URL}/ai-logs`);
  return handleResponse(res);
}

export async function createAiLog(logData) {
  const res = await fetch(`${API_BASE_URL}/ai-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData),
  });
  return handleResponse(res);
}

export async function updateAiLog(id, logData) {
  const res = await fetch(`${API_BASE_URL}/ai-logs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData),
  });
  return handleResponse(res);
}

export async function deleteAiLog(id) {
  const res = await fetch(`${API_BASE_URL}/ai-logs/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// -- RECURSOS --
export async function getResources() {
  const res = await fetch(`${API_BASE_URL}/resources`);
  return handleResponse(res);
}

export async function createResource(resourceData) {
  const res = await fetch(`${API_BASE_URL}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData),
  });
  return handleResponse(res);
}

export async function updateResource(id, resourceData) {
  const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData),
  });
  return handleResponse(res);
}

export async function deleteResource(id) {
  const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
