const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getHeaders(customHeaders = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json', ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) errorMessage = errorJson.detail;
    } catch {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    }
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_username');
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// -- AUTENTICACIÓN --
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse(res);
  if (data.access_token) {
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_username', data.username);
  }
  return data;
}

// -- FASES --
export async function getPhases() {
  const res = await fetch(`${API_BASE_URL}/phases`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

export async function createPhase(phaseData) {
  const res = await fetch(`${API_BASE_URL}/phases`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(phaseData),
  });
  return handleResponse(res);
}

export async function updatePhase(id, phaseData) {
  const res = await fetch(`${API_BASE_URL}/phases/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(phaseData),
  });
  return handleResponse(res);
}

// -- BITÁCORA IA --
export async function getAiLogs() {
  const res = await fetch(`${API_BASE_URL}/ai-logs`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

export async function createAiLog(logData) {
  const res = await fetch(`${API_BASE_URL}/ai-logs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(logData),
  });
  return handleResponse(res);
}

export async function updateAiLog(id, logData) {
  const res = await fetch(`${API_BASE_URL}/ai-logs/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(logData),
  });
  return handleResponse(res);
}

export async function deleteAiLog(id) {
  const res = await fetch(`${API_BASE_URL}/ai-logs/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
}

// -- RECURSOS --
export async function getResources() {
  const res = await fetch(`${API_BASE_URL}/resources`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

export async function createResource(resourceData) {
  const res = await fetch(`${API_BASE_URL}/resources`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(resourceData),
  });
  return handleResponse(res);
}

export async function updateResource(id, resourceData) {
  const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(resourceData),
  });
  return handleResponse(res);
}

export async function deleteResource(id) {
  const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
}
