import axios from 'axios';

// Create an Axios instance pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
});

// Helper functions that exactly match your FastAPI endpoints
export const fetchDeals = async () => {
  const response = await api.get('/deals');
  return response.data;
};

export const updateDealStage = async (dealId, newStage) => {
  const response = await api.patch(`/deals/${dealId}/stage`, {
    stage: newStage,
    changed_by: "mock-user-uuid" // We will replace this during Stage 5 integration
  });
  return response.data;
};

export const fetchDealHistory = async (dealId) => {
  const response = await api.get(`/deals/${dealId}/history`);
  return response.data;
};