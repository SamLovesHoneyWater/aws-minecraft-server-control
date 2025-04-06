
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { 
  fetchInstanceIp, 
  startInstance, 
  stopInstance,
  startService,
  stopService,
  getInstanceStatus,
  getServiceStatus,
  InstanceStatus,
  ServiceStatus
} from "@/services/ec2Service";
import StatusIndicator from "@/components/StatusIndicator";
import ServiceStatusIndicator from "@/components/ServiceStatusIndicator";
import IPAddressDisplay from "@/components/IPAddressDisplay";
import { PowerOff, RefreshCw, Play, Power } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";

const STATUS_FRESHNESS_TIMEOUT = 30000; // 30 seconds

const EC2Dashboard = () => {
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
  const [statusFresh, setStatusFresh] = useState(true);
  const statusTimerRef = useRef<number | null>(null);

  const startFreshnessTimer = () => {
    // Clear any existing timer
    if (statusTimerRef.current) {
      window.clearTimeout(statusTimerRef.current);
    }
    
    // Set status as fresh
    setStatusFresh(true);
    
    // Start a new timer
    statusTimerRef.current = window.setTimeout(() => {
      setStatusFresh(false);
    }, STATUS_FRESHNESS_TIMEOUT);
  };

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
        
        // Start freshness timer
        startFreshnessTimer();
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

  useEffect(() => {
    fetchStatus();
    
    // Clear timer when component unmounts
    return () => {
      if (statusTimerRef.current) {
        window.clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

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

  const isInstanceRunning = instanceStatus.state === 'running';
  const isServiceRunning = serviceStatus.state === 'running';
  const isAnyActionInProgress = actionLoading !== null;
  
  // State to determine which card should be active
  const instanceActive = !isInstanceRunning && !isAnyActionInProgress;
  const serviceActive = isInstanceRunning && !isServiceRunning && !isAnyActionInProgress;
  const shutdownActive = isInstanceRunning && !isAnyActionInProgress;

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Minecraft Server Control</h2>
          {isInstanceRunning && 
            <div className="flex items-center gap-2">
              <StatusIndicator 
                status={instanceStatus.state} 
                className={!statusFresh ? "opacity-70" : ""} 
              />
              {isInstanceRunning && 
                <ServiceStatusIndicator 
                  status={serviceStatus.state} 
                  isFresh={statusFresh}
                />
              }
            </div>
          }
        </div>
        
        {instanceStatus.ipAddress && 
          <IPAddressDisplay ipAddress={instanceStatus.ipAddress} isLoading={loading} />
        }
        
        <button 
          onClick={fetchStatus} 
          disabled={loading}
          className={cn(
            "flex items-center gap-1 px-3 py-2 rounded-md transition-colors",
            !statusFresh ? "text-primary font-medium bg-blue-50 hover:bg-blue-100" : "text-muted-foreground hover:bg-slate-100"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Boot Up Card */}
        <DashboardCard
          title="Boot Up"
          icon={<Power className="h-16 w-16 text-green-500" />}
          actionLabel="Start Server"
          onClick={handleStartInstance}
          disabled={!instanceActive}
          isLoading={actionLoading === "start-instance"}
          variant="success"
        />
        
        {/* Play Card */}
        <DashboardCard
          title="Play"
          icon={
            <svg className="h-16 w-16 text-blue-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M0 0v512h512V0H0zm32 32H256v160h-64v-96h-32v96H32V32zm160 0h96v32H192V32zm128 0h160v160H320V32zM64 224h96v32H64v-32zm128 0h128v32H192v-32zm160 0h96v32h-96v-32zM32 288h128v64h32v-64h128v64h32v-64h128v192H32V288z" />
            </svg>
          }
          actionLabel="Start Game"
          onClick={handleStartService}
          disabled={!serviceActive}
          isLoading={actionLoading === "start-service"}
          variant="primary"
        />
        
        {/* Shut Down Card */}
        <DashboardCard
          title="Shut Down"
          icon={<PowerOff className="h-16 w-16 text-red-500" />}
          actionLabel="Stop Server"
          onClick={handleStopInstance}
          disabled={!shutdownActive}
          isLoading={actionLoading === "stop-instance"}
          variant="destructive"
        />
      </div>

      {!statusFresh && (
        <div className="mt-4 bg-yellow-50 p-3 rounded-md text-amber-700 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Status information may be outdated. Please refresh to see the latest status.
        </div>
      )}
    </div>
  );
};

export default EC2Dashboard;
