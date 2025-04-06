
import StatusIndicator from "@/components/StatusIndicator";
import ServiceStatusIndicator from "@/components/ServiceStatusIndicator";
import { InstanceStatus, ServiceStatus } from "@/services/ec2Service";

interface StatusBarProps {
  instanceStatus: InstanceStatus;
  serviceStatus: ServiceStatus;
  statusFresh: boolean;
  isInstanceRunning: boolean;
}

const StatusBar = ({ 
  instanceStatus, 
  serviceStatus, 
  statusFresh,
  isInstanceRunning
}: StatusBarProps) => {
  return (
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
  );
};

export default StatusBar;
