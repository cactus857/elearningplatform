import { API_ENDPOINT } from "@/constants/endpoint";
import { IRole, IUser, TUserProfileRes } from "@/types/backend";
import api from "@/utils/api";

type Role = Omit<IRole, "permissions" | "description" | "isActive">;

export type Users = IUser & {
  role: Role;
};

interface TGetUsersRes {
  data: Users[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId: string;
  avatar?: string;
  status?: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

// Get all users with pagination and filters
export const getAllUsers = async (
  page: number,
  limit: number,
  search?: string,
  role?: string
): Promise<TGetUsersRes> => {
  const response = await api.get<TGetUsersRes>(API_ENDPOINT.GET_ALL_USERS, {
    params: {
      page,
      limit,
      ...(search && { search }),
      ...(role && { role }),
    },
  });
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string): Promise<TUserProfileRes> => {
  const response = await api.get<TUserProfileRes>(
    `${API_ENDPOINT.GET_ALL_USERS}/${id}`
  );
  return response.data;
};

// Create new user
export const createUser = async (
  payload: CreateUserPayload
): Promise<IUser> => {
  const response = await api.post<IUser>(API_ENDPOINT.CREATE_USER, payload);
  return response.data;
};

// Update user
export const updateUser = async (
  id: string,
  payload: UpdateUserPayload
): Promise<TUserProfileRes> => {
  const response = await api.put<TUserProfileRes>(
    `${API_ENDPOINT.UPDATE_USER}/${id}`,
    payload
  );
  return response.data;
};

// Delete user (soft delete)
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`${API_ENDPOINT.GET_ALL_USERS}/${id}`);
};
