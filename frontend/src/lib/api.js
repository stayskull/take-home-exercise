const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3500";

// Helper for fetch requests
const fetchData = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    throw new Error(
      errorData.error || errorData.message || "An unknown error occurred"
    );
  }
  // Handle 204 No Content for DELETE requests gracefully
  if (res.status === 204) return {};
  return res.json();
};

// Company API calls
export const fetchCompanies = async () => fetchData(`${API_BASE_URL}/company`);
export const fetchCompanyById = async (id) =>
  fetchData(`${API_BASE_URL}/company/${id}`);
export const createCompany = async (companyData) =>
  fetchData(`${API_BASE_URL}/company`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(companyData),
  });
export const updateCompany = async (id, companyData) =>
  fetchData(`${API_BASE_URL}/company/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(companyData),
  });
export const deleteCompany = async (id) =>
  fetchData(`${API_BASE_URL}/company/${id}`, {
    method: "DELETE",
  });

// Persona API calls
export const fetchPersonasByCompanyId = async (companyId) =>
  fetchData(`${API_BASE_URL}/persona?company_id=${companyId}`);
export const fetchPersonaById = async (id) =>
  fetchData(`${API_BASE_URL}/persona/${id}`);
export const createPersona = async (personaData) =>
  fetchData(`${API_BASE_URL}/persona`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(personaData),
  });
export const updatePersona = async (id, personaData) =>
  fetchData(`${API_BASE_URL}/persona/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(personaData),
  });
export const deletePersona = async (id) =>
  fetchData(`${API_BASE_URL}/persona/${id}`, {
    method: "DELETE",
  });

// Chat API call
export const chatWithPersona = async (
  persona_id,
  user_question,
  conversation_id = null
) =>
  fetchData(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona_id, user_question, conversation_id }),
  });
export const fetchConversationLogs = async (conversationId) =>
  fetchData(
    `${API_BASE_URL}/conversation_log?conversation_id=${conversationId}`
  );
export const fetchConversationsByPersona = async (conversationId) =>
  fetchData(`${API_BASE_URL}/conversation?persona_id=${conversationId}`);
