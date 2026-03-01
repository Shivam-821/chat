import axios from "axios";
import toast from "react-hot-toast";

// Base URL for the backend API
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  avatarPublicId?: string;
  about?: string;
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
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Session expired or invalid token",
    );
    return null;
  }
};

export const updateProfileApi = async (
  data: { name?: string; about?: string; avatar?: File | null },
  token: string,
): Promise<User | null> => {
  try {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.about !== undefined) formData.append("about", data.about);
    if (data.avatar) formData.append("avatar", data.avatar);

    const res = await axios.patch(`${API_URL}/auth/profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success("Profile updated!");
    return res.data.data.user;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update profile");
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
  name: string,
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse["data"] | null> => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}/auth/register`, {
      name,
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

export const logoutApi = async (token: string) => {
  try {
    console.log(token);
    const res = await axios.get(`${API_URL}/auth/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res.data);
    toast.success("Signed out successfully!");
    return res.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Logout failed");
    return null;
  }
};

export const checkUsernameApi = async (username: string) => {
  try {
    const res = await axios.get(`${API_URL}/auth/check-username`, {
      params: { username },
    });
    return true; // Available
  } catch (error: any) {
    if (error.response?.status !== 409) {
      toast.error(error.response?.data?.message || "Failed to check username");
    }
    return false; // Taken or error
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

export const getIncomingRequestsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/users/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.requests;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch incoming requests",
    );
    return null;
  }
};

export const updateRequestStatusApi = async (
  requestId: string,
  status: "accepted" | "rejected",
  token: string,
) => {
  try {
    const res = await axios.put(
      `${API_URL}/users/requests/${requestId}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    toast.success(`Request ${status} successfully!`);
    return true;
  } catch (error: any) {
    toast.error(error.response?.data?.message || `Failed to ${status} request`);
    return false;
  }
};

// --- Group API ---

export const createGroupApi = async (
  name: string,
  members: string[],
  token: string,
) => {
  try {
    const res = await axios.post(
      `${API_URL}/groups`,
      { name, members },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    toast.success("Group created successfully!");
    return res.data.data.group;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to create group");
    return null;
  }
};

export const getMyGroupsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.groups;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch groups");
    return null;
  }
};

export const requestJoinGroupApi = async (groupId: string, token: string) => {
  try {
    await axios.post(
      `${API_URL}/groups/${groupId}/join-request`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    toast.success("Join request sent!");
    return true;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to send join request");
    return false;
  }
};

export const getGroupJoinRequestsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/groups/join-requests/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.requests as any[];
  } catch (error: any) {
    return null;
  }
};

export const updateGroupJoinRequestApi = async (
  requestId: string,
  status: "accepted" | "rejected",
  token: string,
) => {
  try {
    await axios.patch(
      `${API_URL}/groups/join-requests/${requestId}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    toast.success(`Request ${status}!`);
    return true;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update request");
    return false;
  }
};

export const searchGroupsApi = async (query: string, token: string) => {
  try {
    const res = await axios.get(
      `${API_URL}/groups/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data.data.groups as {
      _id: string;
      name: string;
      members: any[];
    }[];
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Search failed");
    return null;
  }
};

export const getGroupByIdApi = async (groupId: string, token: string) => {
  try {
    const res = await axios.get(`${API_URL}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.group;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch group details",
    );
    return null;
  }
};

export const getGroupByNameApi = async (groupName: string, token: string) => {
  try {
    const encodedName = encodeURIComponent(groupName);
    const res = await axios.get(`${API_URL}/groups/name/${encodedName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.group;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch group details",
    );
    return null;
  }
};

export const leaveGroupApi = async (groupId: string, token: string) => {
  try {
    await axios.delete(`${API_URL}/groups/${groupId}/leave`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Successfully left the group!");
    return true;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to leave group");
    return false;
  }
};

export const deleteGroupApi = async (groupId: string, token: string) => {
  try {
    await axios.delete(`${API_URL}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Group deleted successfully!");
    return true;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to delete group");
    return false;
  }
};

export const addMembersApi = async (
  groupId: string,
  memberIds: string[],
  token: string,
) => {
  try {
    const res = await axios.post(
      `${API_URL}/groups/${groupId}/members`,
      { memberIds },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    toast.success("Members added successfully!");
    return res.data.data.group;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to add members");
    return null;
  }
};

export const getContactsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/users/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.contacts;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch contacts");
    return null;
  }
};

export const getAdminGroupsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/groups/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.groups;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch admin groups",
    );
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

// --- Notification API ---

export interface Notification {
  _id: string;
  user: string;
  title: string;
  content: string;
  task?: string;
  read: boolean;
  notificationType: "request" | "greeting" | "task" | "random";
  createdAt: string;
}

export const getNotificationsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.notifications;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch notifications",
    );
    return null;
  }
};

export const getUnreadNotificationsCountApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/notifications/unread`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.notifications;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to fetch unread notifications",
    );
    return null;
  }
};

export const markNotificationAsReadApi = async (
  notificationId: string,
  token: string,
) => {
  try {
    const res = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return true; // We don't always need to toast a success for marking read to avoid spam
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to mark as read");
    return false;
  }
};

export const deleteNotificationApi = async (
  notificationId: string,
  token: string,
) => {
  try {
    const res = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    toast.success("Notification deleted!");
    return true;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to delete notification",
    );
    return false;
  }
};

// --- Message API ---

export interface ChatMessage {
  _id: string;
  sender: { _id: string; name: string; avatar?: string };
  message: string;
  chatType: "IndividualMessage" | "Group";
  createdAt: string;
  edited?: boolean;
  deleted?: boolean;
}

export const getIndividualMessagesApi = async (
  user1Id: string,
  user2Id: string,
  page: number,
  token: string,
): Promise<{ messages: ChatMessage[]; hasMore: boolean } | null> => {
  try {
    const res = await axios.get(
      `${API_URL}/messages/individual/${user1Id}/${user2Id}?page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to load messages");
    return null;
  }
};

export const getGroupMessagesApi = async (
  groupId: string,
  page: number,
  token: string,
): Promise<{ messages: ChatMessage[]; hasMore: boolean } | null> => {
  try {
    const res = await axios.get(
      `${API_URL}/messages/group/${groupId}?page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to load messages");
    return null;
  }
};

// --- Keys API ---

export const backupKeysApi = async (
  publicKey: any,
  encryptedPrivateKey: number[],
  iv: number[],
  token: string,
) => {
  try {
    const res = await axios.post(
      `${API_URL}/keys/backup`,
      { publicKey, encryptedPrivateKey, iv },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    toast.success("Encryption keys backed up securely!");
    return res.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to backup keys");
    return null;
  }
};

export const getKeysApi = async (userId: string, token: string) => {
  try {
    const res = await axios.get(`${API_URL}/keys/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  } catch (error: any) {
    return null;
  }
};
