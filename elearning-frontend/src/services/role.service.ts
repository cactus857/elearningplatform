import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";
import { Permissions } from "./permission.service";

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

interface CreateRolePayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

type UpdateRolePayload = Partial<CreateRolePayload>;

export interface RoleDetails extends Roles {
  permissions: Permissions[];
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

// Get role by ID
export const getRoleById = async (id: string): Promise<RoleDetails> => {
  const response = await api.get<RoleDetails>(
    `${API_ENDPOINT.GET_ALL_ROLES}/${id}`
  );
  return response.data;
};

// Create new role
export const createRole = async (
  payload: CreateRolePayload
): Promise<Roles> => {
  const response = await api.post<Roles>(API_ENDPOINT.GET_ALL_ROLES, payload);
  return response.data;
};

// Update role
export const updateRole = async (
  id: string,
  payload: UpdateRolePayload
): Promise<RoleDetails> => {
  const response = await api.put<RoleDetails>(
    `${API_ENDPOINT.GET_ALL_ROLES}/${id}`,
    payload
  );
  return response.data;
};

// Delete role (soft delete)
export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`${API_ENDPOINT.GET_ALL_ROLES}/${id}`);
};
