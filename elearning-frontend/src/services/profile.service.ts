import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await api.put(API_ENDPOINT.CHANGE_PASSWORD, payload);
  return response.data;
};
