import { API_ENDPOINT } from "@/constants/endpoint";
import api from "@/utils/api";

// Types
export interface ISearchCourse {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    smallDescription: string | null;
    thumbnail: string | null;
    level: string;
    category: string | null;
    status: string;
    createdAt: string;
    instructor: {
        id: string;
        fullName: string;
        email: string;
        avatar: string | null;
    };
    enrollmentCount: number;
    _score?: number;
    highlight?: {
        title?: string[];
        description?: string[];
    };
}

export interface ISearchCoursesResponse {
    data: ISearchCourse[];
    totalItems: number;
    page: number;
    limit: number;
}

export interface ISearchParams {
    keyword?: string;
    level?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
}

// API Calls

/**
 * Search courses using Elasticsearch
 * This provides full-text search with fuzzy matching and highlighting
 */
export const searchCourses = async (
    params: ISearchParams
): Promise<ISearchCoursesResponse> => {
    const response = await api.get<ISearchCoursesResponse>(
        `${API_ENDPOINT.SEARCH}/courses`,
        { params }
    );
    return response.data;
};

/**
 * Get course suggestions for autocomplete
 * Returns matching course titles based on prefix
 */
export const suggestCourses = async (
    keyword: string
): Promise<{ suggestions: string[] }> => {
    const response = await api.get<{ suggestions: string[] }>(
        `${API_ENDPOINT.SEARCH}/courses/suggest`,
        { params: { keyword } }
    );
    return response.data;
};
