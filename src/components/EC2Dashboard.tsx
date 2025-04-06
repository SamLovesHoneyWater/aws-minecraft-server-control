
import { useEffect } from "react";
import { Power, PowerOff } from "lucide-react";
import IPAddressDisplay from "@/components/IPAddressDisplay";
import DashboardCard from "@/components/DashboardCard";
import StatusBar from "@/components/StatusBar";
import RefreshButton from "@/components/RefreshButton";
import FreshnessWarning from "@/components/FreshnessWarning";
import { useStatusFreshness } from "@/hooks/useStatusFreshness";
import { useServerControl } from "@/hooks/useServerControl";

const STATUS_FRESHNESS_TIMEOUT = 30000; // 30 seconds

const EC2Dashboard = () => {
  const { statusFresh, startFreshnessTimer } = useStatusFreshness(STATUS_FRESHNESS_TIMEOUT);
  const {
    loading,
    instanceStatus,
    serviceStatus,
    actionLoading,
    fetchStatus,
    handleStartInstance,
    handleStopInstance,
    handleStartService,
    isInstanceRunning,
    instanceActive,
    serviceActive,
    shutdownActive
  } = useServerControl(startFreshnessTimer);

  // Initial status fetch on component mount
  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <StatusBar 
          instanceStatus={instanceStatus}
          serviceStatus={serviceStatus}
          statusFresh={statusFresh}
          isInstanceRunning={isInstanceRunning}
        />
        
        {instanceStatus.ipAddress && 
          <IPAddressDisplay ipAddress={instanceStatus.ipAddress} isLoading={loading} />
        }
        
        <RefreshButton 
          onClick={fetchStatus} 
          isLoading={loading}
          isFresh={statusFresh}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Boot Up Card */}
        <DashboardCard
          title="Boot Up"
          icon={<Power className="h-16 w-16 text-green-500" />}
          actionLabel="Start Machine"
          onClick={handleStartInstance}
          disabled={!instanceActive}
          isLoading={actionLoading === "start-instance"}
          variant="success"
        />
        
        {/* Play Card */}
        <DashboardCard
          title="Play"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-label="Minecraft" role="img"
            viewBox="0 0 512 512" stroke-linecap="square" fill="none"><rect
            width="512" height="512"
            rx="15%"
            fill="#111"/><g id="a" transform="matrix(19 11 0 22 76 142)"><path fill="#432" d="M.5.5h9v9h-9"/><path stroke="#864" d="M2 8v1h2V8h5V7 H7V5"/><path stroke="#643" d="M1 5zM2 9zM1 8V7h2V6h1M5 9h2V8H6V4M7 6h1v1M9 9zM9 4v1"/><path stroke="#a75" d="M1 7h1M4 7h1M9 6z"/><path stroke="#555" d="M5 5z"/><path stroke="#593" d="M4 4V1h4v2H7V2H4v1H2v1"/><path stroke="#6a4" d="M2 1h1M6 1zM7 2zM9 1v1"/><path stroke="#7c5" d="M5 3zM3 2h1"/><path stroke="#9c6" d="M1 1v1h1M8 1z"/></g><use xlink:href="#a" transform="matrix(-1 0 0 1 513 0)" opacity=".5"/><g transform="matrix(-19 11-19-11 447 159)"><path fill="#7b4" d="M.5.5h9v9h-9"/><path stroke="#8c5" d="M1 1zM3 1zM4 7zM3 4v2H1v2h3v1h2V7M2 3h4V1H5v1h3M7 4v1H4M9 4v2H8v3"/><path stroke="#ad7" d="M1 3v2M1 7zM1 9zM3 3zM4 4zM5 1zM5 3zM5 5v1M5 8v1M7 2v1M8 7h1"/></g></svg>
          }
          actionLabel="Start or Restart MC Server"
          onClick={handleStartService}
          disabled={!serviceActive}
          isLoading={actionLoading === "start-service"}
          variant="default"
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

      <FreshnessWarning isVisible={!statusFresh} />
    </div>
  );
};

export default EC2Dashboard;
