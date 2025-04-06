
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
