import { API_BASE } from './config';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function checkResponse(res) {
  // Attempt to parse body for error details
  const contentType = res.headers.get('content-type') || '';
  if (res.ok) {
    if (contentType.includes('application/json')) return res.json();
    // fallback to text for non-json (e.g., csv)
    return res.text();
  }

  let errMsg = `HTTP ${res.status} ${res.statusText}`;
  try {
    if (contentType.includes('application/json')) {
      const body = await res.json();
      // common fields
      errMsg = body.message || body.error || JSON.stringify(body) || errMsg;
    } else {
      const text = await res.text();
      if (text) errMsg = text;
    }
  } catch (e) {
    // ignore parse errors
  }
  throw new Error(errMsg);
}

export async function searchProducts(name) {
  const q = name || '';
  // Try dedicated search endpoint first (some backends provide it)
  try {
    const res = await fetch(`${API_BASE}/search?name=${encodeURIComponent(q)}`, { headers: { ...authHeaders() } });
    if (res.ok) {
      const data = await (res.headers.get('content-type') || '').includes('application/json') ? res.json() : [];
      // normalize
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.products)) return data.products;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.items)) return data.items;
      return [];
    }
  } catch (e) {
    // fallthrough to query-param search
    console.warn('search endpoint failed, falling back to query search', e.message);
  }
  // Fallback: try list endpoint with `name` query param first (some backends expect `name`)
  try {
    const resName = await fetch(`${API_BASE}?name=${encodeURIComponent(q)}&limit=500&page=1`, { headers: { ...authHeaders() } });
    if (resName.ok) {
      const data = (resName.headers.get('content-type') || '').includes('application/json') ? await resName.json() : [];
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.products)) return data.products;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.items)) return data.items;
      return [];
    }
  } catch (e) {
    console.warn('fallback name search failed', e.message);
  }

  // Final fallback: use query param `search` on list endpoint
  const result = await getProducts({ page: 1, limit: 500, search: q });
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.products)) return result.products;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.items)) return result.items;
  return [];
}

export async function getProducts({ page = 1, limit = 100, search = '' } = {}) {
  const qs = new URLSearchParams({ page, limit, search }).toString();
  const res = await fetch(`${API_BASE}?${qs}`, { headers: { ...authHeaders() } });
  return checkResponse(res);
}

export async function importProductsCsv(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Import failed');
  }
  return res.json();
}

export async function exportProductsCsv() {
  const res = await fetch(`${API_BASE}/export`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function updateProduct(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  const parsed = await checkResponse(res);
  // normalize common response shapes to return the updated product object
  if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  if (parsed && parsed.data && typeof parsed.data === 'object') return parsed.data;
  if (parsed && parsed.product && typeof parsed.product === 'object') return parsed.product;
  if (parsed && parsed.id) return parsed;
  return parsed;
}

export async function getProductHistory(id) {
  const res = await fetch(`${API_BASE}/${id}/history`, { headers: { ...authHeaders() } });
  const parsed = await checkResponse(res);
  // normalize to array
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.data)) return parsed.data;
  if (parsed && Array.isArray(parsed.logs)) return parsed.logs;
  if (parsed && Array.isArray(parsed.history)) return parsed.history;
  return [];
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Delete failed');
  }
  return true;
}

export default {
  searchProducts,
  getProducts,
  importProductsCsv,
  exportProductsCsv,
  updateProduct,
  getProductHistory,
  deleteProduct,
};
