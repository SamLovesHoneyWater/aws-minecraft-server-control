
import { sha256 } from "crypto-hash";

export interface User {
  username: string;
  passwordHash: string;
}

// Store user in localStorage
export const saveUser = (username: string, passwordHash: string) => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      username,
      passwordHash,
    })
  );
};

// Get the current user from localStorage
export const getUser = (): User | null => {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

// Clear user from localStorage
export const clearUser = () => {
  localStorage.removeItem("user");
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  return !!getUser();
};

// Create the hash for authorization
export const createAuthHash = async (username: string, passwordHash: string, requestName: string): Promise<string> => {
  const composedString = `${username}_${requestName}_${passwordHash}`;
  return await sha256(composedString);
};

// Create authorization payload for API requests
export const createAuthPayload = async (requestName: string): Promise<{ username: string; hash: string } | null> => {
  const user = getUser();
  if (!user) return null;
  
  const hash = await createAuthHash(user.username, user.passwordHash, requestName);
  
  return {
    username: user.username,
    hash
  };
};
