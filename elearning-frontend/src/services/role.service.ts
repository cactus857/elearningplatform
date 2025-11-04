import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";

export interface Roles {
  id: string;
  name: string;
  description: string;
  isActive: boolean | true;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface TGetRolesRes {
  data: Roles[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAllRoles = async (
  page: number,
  limit: number
): Promise<TGetRolesRes> => {
  const response = await api.get<TGetRolesRes>(API_ENDPOINT.GET_ALL_ROLES, {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};
