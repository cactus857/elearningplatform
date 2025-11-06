import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";

export interface Permissions {
  id: string;
  name: string;
  description: string;
  path: string;
  module: string;
  method: string;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface TGetPermissionsRes {
  data: Permissions[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreatePermissionPayload {
  name: string;
  module: string;
  path: string;
  method: string;
}

type UpdatePermissionPayload = Partial<CreatePermissionPayload>;

// Get all permissions with pagination
export const getAllPermissions = async (
  page: number,
  limit: number,
  // search?: string,
  module?: string
): Promise<TGetPermissionsRes> => {
  const response = await api.get<TGetPermissionsRes>(
    API_ENDPOINT.GET_ALL_PERMISSIONS,
    {
      params: {
        page,
        limit,
        // ...(search && { search }),
        ...(module && { module }),
      },
    }
  );
  return response.data;
};

export const getAllModules = async (): Promise<{ module: string }[]> => {
  const res = await api.get(`${API_ENDPOINT.GET_ALL_PERMISSIONS}/modules`);
  // Vì backend trả về { data: [{ module: string }] }
  return res.data.data;
};

// Get permission by ID
export const getPermissionById = async (id: string): Promise<Permissions> => {
  const response = await api.get<Permissions>(
    `${API_ENDPOINT.GET_ALL_PERMISSIONS}/${id}`
  );
  return response.data;
};

// Create new permission
export const createPermission = async (
  payload: CreatePermissionPayload
): Promise<Permissions> => {
  const response = await api.post<Permissions>(
    API_ENDPOINT.GET_ALL_PERMISSIONS,
    payload
  );
  return response.data;
};

// Update permission
export const updatePermission = async (
  id: string,
  payload: UpdatePermissionPayload
): Promise<Permissions> => {
  const response = await api.put<Permissions>(
    `${API_ENDPOINT.GET_ALL_PERMISSIONS}/${id}`,
    payload
  );
  return response.data;
};

// Delete permission (soft delete)
export const deletePermission = async (id: string): Promise<void> => {
  await api.delete(`${API_ENDPOINT.GET_ALL_PERMISSIONS}/${id}`);
};
