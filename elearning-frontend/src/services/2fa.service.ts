import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";

interface Setup2faResponse {
  secret: string;
  uri: string;
}

interface Disable2faPayload {
  code: string;
}

interface Enable2faPayload {
  totpCode: string;
}

export const setupTwoFactorAuth = async () => {
  const response = await api.post<Setup2faResponse>(API_ENDPOINT.SETUP_2FA, {});
  return response.data;
};

export const disableTwoFactorAuth = async (payload: Disable2faPayload) => {
  const response = await api.post(API_ENDPOINT.DISABLE_2FA, payload);
  return response.data;
};

export const enableTwoFactorAuth = async (payload: Enable2faPayload) => {
  const response = await api.post(API_ENDPOINT.ENABLE_2FA, payload);
  return response.data;
};
