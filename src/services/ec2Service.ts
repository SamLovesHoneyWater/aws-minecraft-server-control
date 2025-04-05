
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

export interface ServiceStatus {
  state: 'running' | 'stopped' | 'unknown';
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
    const response = await fetchWithAuth("/start_instance");
    
    if (!response.success) {
      throw new Error(response.message);
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
    const response = await fetchWithAuth("/stop_instance");
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    toast.success("Instance stop initiated");
    return { success: true };
  } catch (error) {
    console.error("Error stopping instance:", error);
    toast.error("Failed to stop instance");
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const startService = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth("/start_service");
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    toast.success("Service start initiated");
    return { success: true };
  } catch (error) {
    console.error("Error starting service:", error);
    toast.error("Failed to start service");
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const stopService = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth("/stop_service");
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    toast.success("Service stop initiated");
    return { success: true };
  } catch (error) {
    console.error("Error stopping service:", error);
    toast.error("Failed to stop service");
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const getServiceStatus = async (): Promise<ApiResponse<ServiceStatus>> => {
  try {
    const response = await fetchWithAuth("/service_status");
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    const serviceState = response.data?.state || 'unknown';
    return {
      success: true,
      data: {
        state: serviceState
      }
    };
  } catch (error) {
    console.error("Error getting service status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: {
        state: 'unknown'
      }
    };
  }
};

export const getInstanceStatus = async (): Promise<ApiResponse<InstanceStatus>> => {
  try {
    const ipResponse = await fetchInstanceIp();
    
    // Check both for success and a valid IP (not "None")
      if (ipResponse.success && ipResponse.data && 
        ipResponse.data !== "None") {
        return {
        success: true,
        data: {
          ipAddress: ipResponse.data,
          state: 'running'
        }
        };
      } else {
        // If IP cannot be fetched or is "None", we assume instance is stopped
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
