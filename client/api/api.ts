import axios from "axios";
import toast from "react-hot-toast";

// Base URL for the backend API
const API_URL = "http://localhost:3001/api/v1";

export interface User {
  username: string;
  email: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
  message: string;
  success: boolean;
}

// Config for sending cookies automatically if needed
axios.defaults.withCredentials = true;

export const verifyTokenApi = async (token: string): Promise<User | null> => {
  try {
    const res = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data.user;
  } catch (error) {
    toast.error("Session expired or invalid token");
    return null;
  }
};

export const loginApi = async (
  email: string,
  password: string,
): Promise<AuthResponse["data"] | null> => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
      email,
      password,
    });
    toast.success("Signed in successfully!");
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Login failed");
    return null;
  }
};

export const registerApi = async (
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse["data"] | null> => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}/auth/register`, {
      username,
      email,
      password,
    });
    toast.success("Account created successfully!");
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Registration failed");
    return null;
  }
};

export const addContactApi = async (identifier: string, token: string) => {
  try {
    const res = await axios.post(
      `${API_URL}/users/add-contact`,
      { identifier },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    toast.success("Contact added successfully!");
    return res.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to add contact");
    return null;
  }
};

// --- Task API ---

export const getTasksApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch tasks");
    return null;
  }
};

export const createTaskApi = async (taskData: any, token: string) => {
  try {
    const res = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Task created successfully!");
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to create task");
    return null;
  }
};

export const updateTaskApi = async (
  taskId: string,
  taskData: any,
  token: string,
) => {
  try {
    const res = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Task updated successfully!");
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update task");
    return null;
  }
};

export const deleteTaskApi = async (taskId: string, token: string) => {
  try {
    const res = await axios.delete(`${API_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Task deleted successfully!");
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to delete task");
    return null;
  }
};
