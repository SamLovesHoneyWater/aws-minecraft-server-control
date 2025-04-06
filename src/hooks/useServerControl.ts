
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  startInstance, 
  stopInstance,
  startService,
  InstanceStatus,
  ServiceStatus,
  getInstanceStatus,
  getServiceStatus
} from "@/services/ec2Service";

export const useServerControl = (onStatusUpdate: () => void) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus>({
    ipAddress: null,
    state: 'unknown'
  });
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    state: 'unknown'
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const instanceResponse = await getInstanceStatus();
      if (instanceResponse.success && instanceResponse.data) {
        setInstanceStatus(instanceResponse.data);
        
        // Only fetch service status if instance is running
        if (instanceResponse.data.state === 'running') {
          const serviceResponse = await getServiceStatus();
          if (serviceResponse.success && serviceResponse.data) {
            setServiceStatus(serviceResponse.data);
          } else {
            setServiceStatus({ state: 'unknown' });
            toast({
              title: "Service Status Error",
              description: serviceResponse.error || "Failed to get service status",
              variant: "destructive"
            });
          }
        } else {
          // If instance is not running, service must be stopped
          setServiceStatus({ state: 'stopped' });
        }
        
        // Call the callback to start freshness timer
        onStatusUpdate();
      } else {
        toast({
          title: "Error",
          description: instanceResponse.error || "Failed to get instance status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstance = async () => {
    setActionLoading("start-instance");
    try {
      await startInstance();
      // Set optimistic UI update
      setInstanceStatus(prev => ({ ...prev, state: 'pending' }));
      // Refresh status after a delay to give time for the operation to take effect
      setTimeout(() => fetchStatus(), 7000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopInstance = async () => {
    setActionLoading("stop-instance");
    try {
      await stopInstance();
      // Set optimistic UI update
      setInstanceStatus(prev => ({ ...prev, state: 'stopping' }));
      // Refresh status after a delay to give time for the operation to take effect
      setTimeout(() => fetchStatus(), 10000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartService = async () => {
    setActionLoading("start-service");
    try {
      await startService();
      // Set optimistic UI update
      setServiceStatus({ state: 'running' });
      // Refresh status after a delay
      setTimeout(() => fetchStatus(), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  // Derived state
  const isInstanceRunning = instanceStatus.state === 'running';
  const isServiceRunning = serviceStatus.state === 'running';
  const isAnyActionInProgress = actionLoading !== null;
  
  // Activity state for each card
  const instanceActive = !isInstanceRunning && !isAnyActionInProgress;
  const serviceActive = isInstanceRunning && !isServiceRunning && !isAnyActionInProgress;
  const shutdownActive = isInstanceRunning && !isAnyActionInProgress;

  return {
    loading,
    instanceStatus,
    serviceStatus,
    actionLoading,
    fetchStatus,
    handleStartInstance,
    handleStopInstance,
    handleStartService,
    isInstanceRunning,
    isServiceRunning,
    isAnyActionInProgress,
    instanceActive,
    serviceActive,
    shutdownActive
  };
};
