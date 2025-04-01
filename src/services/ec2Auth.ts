
import { createAuthPayload } from "@/utils/auth";
import { toast } from "sonner";

interface EC2Response {
  success: boolean;
  message: string;
  data?: any;
}

const API_BASE_URL = "https://1s0xmoohs9.execute-api.us-east-2.amazonaws.com";

export const fetchWithAuth = async (endpoint: string, method: string = "POST", body?: any): Promise<EC2Response> => {
  try {
    const requestName = endpoint.split('/').pop() || endpoint; // Extract request name from endpoint
    const authPayload = await createAuthPayload(requestName);
    
    if (!authPayload) {
      toast.error("Authentication required");
      return {
        success: false,
        message: "Authentication required",
      };
    }
    
    // Merge auth payload with any existing body
    const requestBody = {
      ...authPayload,
      ...(body || {})
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      toast.error(errorData.message || `Error: ${response.status}`);
      return {
        success: false,
        message: errorData.message || `Error: ${response.status}`,
      };
    }
    
    const data = await response.json().catch(() => ({}));
    
    return {
      success: true,
      message: data.message || "Success",
      data,
    };
  } catch (error) {
    console.error(`Error with ${endpoint}:`, error);
    toast.error(error instanceof Error ? error.message : "Unknown error occurred");
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const getIpAddress = async (): Promise<string> => {
  const response = await fetchWithAuth("/ip_addr");
  return response.success ? response.data?.ip_address || "Error fetching IP" : "Authentication required";
};

export const startInstance = async (): Promise<EC2Response> => {
  return await fetchWithAuth("/start_instance", "POST");
};

export const stopInstance = async (): Promise<EC2Response> => {
  return await fetchWithAuth("/stop_instance", "POST");
};

export const restartService = async (): Promise<EC2Response> => {
  return await fetchWithAuth("/restart_service", "POST");
};
