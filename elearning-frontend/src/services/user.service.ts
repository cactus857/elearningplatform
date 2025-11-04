import { API_ENDPOINT } from "@/constants/endpoint";
import { IRole, IUser } from "@/types/backend";
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
