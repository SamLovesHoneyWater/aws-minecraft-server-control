
import { useEffect } from "react";
import { Power, PowerOff } from "lucide-react";
import IPAddressDisplay from "@/components/IPAddressDisplay";
import DashboardCard from "@/components/DashboardCard";
import StatusBar from "@/components/StatusBar";
import RefreshButton from "@/components/RefreshButton";
import FreshnessWarning from "@/components/FreshnessWarning";
import { useStatusFreshness } from "@/hooks/useStatusFreshness";
import { useServerControl } from "@/hooks/useServerControl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const STATUS_FRESHNESS_TIMEOUT = 5000; // 5 seconds

const EC2Dashboard = () => {
  const { statusFresh, startFreshnessTimer } = useStatusFreshness(STATUS_FRESHNESS_TIMEOUT);
  const {
    loading,
    instanceStatus,
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

  // All actions should be disabled if status is outdated
  const actionsDisabled = !statusFresh;

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <StatusBar 
          instanceStatus={instanceStatus}
          statusFresh={statusFresh}
          isInstanceRunning={isInstanceRunning}
        />
        
        {instanceStatus.ipAddress && 
          <IPAddressDisplay ipAddress={instanceStatus.ipAddress} isLoading={loading} />
        }
      </div>

      {/* Prominent Refresh Button */}
      <div className="flex justify-center mb-6">
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
          disabled={!instanceActive || actionsDisabled}
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
          actionLabel="Run MC Server"
          onClick={handleStartService}
          disabled={!serviceActive || actionsDisabled}
          isLoading={actionLoading === "start-service"}
          variant="default"
        />
        
        {/* Shut Down Card */}
        <DashboardCard
          title="Shut Down"
          icon={<PowerOff className="h-16 w-16 text-red-500" />}
          actionLabel="Stop and Clean Up"
          onClick={handleStopInstance}
          disabled={!shutdownActive || actionsDisabled}
          isLoading={actionLoading === "stop-instance"}
          variant="destructive"
        />
      </div>

      <FreshnessWarning isVisible={!statusFresh} />

      {/* User Instructions Section */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">How to Use This Dashboard</h3>
        
        <div className="space-y-4">
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 font-bold">1</span>
              First: Boot Up the Machine
            </AlertTitle>
            <AlertDescription>
              Click the "Start Machine" button to power on the remote system. This is required before doing anything else.
              Booting up usually takes less than 5 seconds.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold">2</span>
              Then: Start or Restart the Minecraft Server
            </AlertTitle>
            <AlertDescription>
              Once the machine is running, click "Run MC Server" to start the Minecraft server. 
              <strong className="block mt-2">Important Notes:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li className="text-amber-600 font-medium">The server typically takes about 30 seconds to start up, please wait patiently</li>
                <li className="text-amber-600 font-medium">⚠️ Warning: Do not click "Run MC Server" multiple times in quick succession! Failure to comply might result in world file corruption!</li>
                <li>The server status is not displayed here - check your Minecraft client to confirm it's running</li>
                <li>If there are issues with the server, you can also restart it with the run server button</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold">3</span>
              When Done: Shut Down the System
            </AlertTitle>
            <AlertDescription>
              When the last player leaves the server, you <strong>must</strong> shut down the system by clicking "Stop and Clean Up".
              <p>
                Failing to shut down will waste server resources -- the admin will be sad and might bill you for server costs.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default EC2Dashboard;
