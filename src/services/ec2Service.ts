
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

export const getInstanceStatus = async (): Promise<ApiResponse<InstanceStatus>> => {
  try {
    const response = await fetchWithAuth("/instance_status");
    
    if (!response.success) {
      throw new Error(response.message);
    }
    
    // Extract state and IP address from the response
    const state = response.data?.state || 'unknown';
    const ipAddress = response.data?.ip_address || null;
    
    return {
      success: true,
      data: {
        ipAddress,
        state: state as 'running' | 'stopped' | 'pending' | 'stopping' | 'unknown'
      }
    };
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
