export interface User {
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Simulated backend verification function
export const verifyTokenApi = async (token: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app this would call your backend endpoint /api/verify
      if (token === "dummy-jwt-token-123") {
        resolve({
          username: "alexdev_",
          email: "alex@example.com",
        });
      } else {
        reject(new Error("Invalid token"));
      }
    }, 800); // simulate network delay
  });
};

export const loginApi = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app this would POST to /api/login
      if (email && password) {
        resolve({
          user: {
            username: email.split("@")[0],
            email: email,
          },
          token: "dummy-jwt-token-123",
        });
      } else {
        reject(new Error("Email and password required"));
      }
    }, 1000);
  });
};

export const registerApi = async (
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app this would POST to /api/register
      if (username && email && password) {
        resolve({
          user: {
            username,
            email,
          },
          token: "dummy-jwt-token-123",
        });
      } else {
        reject(new Error("All fields are required"));
      }
    }, 1000);
  });
};
