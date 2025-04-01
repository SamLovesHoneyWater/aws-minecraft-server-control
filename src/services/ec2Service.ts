
import { toast } from "sonner";
import { fetchWithAuth } from "./ec2Auth";

interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: string;
}

export interface InstanceStatus {
  ipAddress: string | null;
  state: 'running' | 'stopped' | 'pending' | 'stopping' | 'unknown';
}

const BASE_URL = 'https://1s0xmoohs9.execute-api.us-east-2.amazonaws.com';

export const fetchInstanceIp = async (): Promise<ApiResponse<string>> => {
  try {
    // Use the authenticated method from ec2Auth.ts instead
    const response = await fetchWithAuth("/ip_addr");
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    return { 
      success: true, 
      data: response.data?.public_ip || "No IP available" 
    };
  } catch (error) {
    console.error("Error fetching instance IP:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const startInstance = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${BASE_URL}/start_instance`, { 
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start instance: ${response.statusText}`);
    }
    
    toast.success("Instance start initiated");
    return { success: true };
  } catch (error) {
    console.error("Error starting instance:", error);
    toast.error("Failed to start instance");
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const stopInstance = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${BASE_URL}/stop_instance`, { 
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to stop instance: ${response.statusText}`);
    }
    
    toast.success("Instance stop initiated");
    return { success: true };
  } catch (error) {
    console.error("Error stopping instance:", error);
    toast.error("Failed to stop instance");
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const restartService = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${BASE_URL}/restart_service`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to restart service: ${response.statusText}`);
    }
    
    toast.success("Service restart initiated");
    return { success: true };
  } catch (error) {
    console.error("Error restarting service:", error);
    toast.error("Failed to restart service");
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const getInstanceStatus = async (): Promise<ApiResponse<InstanceStatus>> => {
  try {
    const ipResponse = await fetchInstanceIp();
    
    // If IP is fetched successfully, we assume the instance is running
    if (ipResponse.success && ipResponse.data) {
      return {
        success: true,
        data: {
          ipAddress: ipResponse.data,
          state: 'running'
        }
      };
    } else {
      // If IP cannot be fetched, we assume instance is stopped
      return {
        success: true,
        data: {
          ipAddress: null,
          state: 'stopped'
        }
      };
    }
  } catch (error) {
    console.error("Error getting instance status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: {
        ipAddress: null,
        state: 'unknown'
      }
    };
  }
};
