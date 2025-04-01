
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchInstanceIp, 
  startInstance, 
  stopInstance, 
  restartService, 
  getInstanceStatus,
  InstanceStatus
} from "@/services/ec2Service";
import StatusIndicator from "@/components/StatusIndicator";
import ActionButton from "@/components/ActionButton";
import IPAddressDisplay from "@/components/IPAddressDisplay";
import { PlayCircle, StopCircle, RefreshCcw, RefreshCw } from "lucide-react";

const EC2Dashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus>({
    ipAddress: null,
    state: 'unknown'
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await getInstanceStatus();
      if (response.success && response.data) {
        setInstanceStatus(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to get instance status",
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
    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartInstance = async () => {
    setActionLoading("start");
    try {
      await startInstance();
      // Set optimistic UI update
      setInstanceStatus(prev => ({ ...prev, state: 'pending' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopInstance = async () => {
    setActionLoading("stop");
    try {
      await stopInstance();
      // Set optimistic UI update
      setInstanceStatus(prev => ({ ...prev, state: 'stopping' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestartService = async () => {
    setActionLoading("restart");
    try {
      await restartService();
    } finally {
      setActionLoading(null);
    }
  };

  const isInstanceRunning = instanceStatus.state === 'running';

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">EC2 Instance Control</CardTitle>
          <StatusIndicator status={instanceStatus.state} />
        </CardHeader>
        <CardContent className="space-y-4">
          <IPAddressDisplay ipAddress={instanceStatus.ipAddress} isLoading={loading} />
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              variant="success"
              onClick={handleStartInstance}
              disabled={isInstanceRunning || instanceStatus.state === 'pending'}
              isLoading={actionLoading === "start"}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Start Instance
            </ActionButton>
            
            <ActionButton
              variant="destructive"
              onClick={handleStopInstance}
              disabled={instanceStatus.state === 'stopped' || instanceStatus.state === 'stopping'}
              isLoading={actionLoading === "stop"}
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Stop Instance
            </ActionButton>
          </div>
          
          <ActionButton
            variant="secondary"
            onClick={handleRestartService}
            disabled={!isInstanceRunning}
            isLoading={actionLoading === "restart"}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Restart Service
          </ActionButton>
          
          <div className="flex justify-center mt-2">
            <button 
              onClick={fetchStatus} 
              disabled={loading}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
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
