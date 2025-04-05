
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import ActionButton from "@/components/ActionButton";
import IPAddressDisplay from "@/components/IPAddressDisplay";
import { PlayCircle, StopCircle, RefreshCw } from "lucide-react";

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
      setTimeout(() => fetchStatus(), 5000);
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
      setTimeout(() => fetchStatus(), 5000);
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

  const handleStopService = async () => {
    setActionLoading("stop-service");
    try {
      await stopService();
      // Set optimistic UI update
      setServiceStatus({ state: 'stopped' });
      // Refresh status after a delay
      setTimeout(() => fetchStatus(), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const isInstanceRunning = instanceStatus.state === 'running';
  const isServiceRunning = serviceStatus.state === 'running';
  const isAnyActionInProgress = actionLoading !== null;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">EC2 Instance Control</CardTitle>
          <StatusIndicator 
            status={instanceStatus.state} 
            className={!statusFresh ? "opacity-70" : ""}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <IPAddressDisplay ipAddress={instanceStatus.ipAddress} isLoading={loading} />
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              variant="success"
              onClick={handleStartInstance}
              disabled={isInstanceRunning || instanceStatus.state === 'pending' || isAnyActionInProgress}
              isLoading={actionLoading === "start-instance"}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Start Instance
            </ActionButton>
            
            <ActionButton
              variant="destructive"
              onClick={handleStopInstance}
              disabled={instanceStatus.state === 'stopped' || instanceStatus.state === 'stopping' || isAnyActionInProgress}
              isLoading={actionLoading === "stop-instance"}
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Stop Instance
            </ActionButton>
          </div>
          
          <Card className="mt-6">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-md">Service Control</CardTitle>
              <ServiceStatusIndicator 
                status={serviceStatus.state} 
                isFresh={statusFresh}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ActionButton
                  variant="success"
                  onClick={handleStartService}
                  disabled={!isInstanceRunning || isServiceRunning || isAnyActionInProgress}
                  isLoading={actionLoading === "start-service"}
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Start Service
                </ActionButton>
                
                <ActionButton
                  variant="destructive"
                  onClick={handleStopService}
                  disabled={!isInstanceRunning || serviceStatus.state === 'stopped' || isAnyActionInProgress}
                  isLoading={actionLoading === "stop-service"}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop Service
                </ActionButton>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-2">
            <button 
              onClick={fetchStatus} 
              disabled={loading}
              className={cn(
                "flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-slate-100 transition-colors",
                !statusFresh ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <RefreshCw className="h-3 w-3" />
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EC2Dashboard;
