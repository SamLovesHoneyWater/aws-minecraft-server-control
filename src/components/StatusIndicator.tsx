
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: 'running' | 'stopped' | 'pending' | 'stopping' | 'unknown';
  className?: string;
  isFresh?: boolean;
}

const StatusIndicator = ({ status, className, isFresh = true }: StatusIndicatorProps) => {
  const getStatusColor = () => {
    if (!isFresh) return 'bg-gray-400';
    
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'pending':
      case 'stopping':
        return 'bg-yellow-500 animate-pulse';
      case 'unknown':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    let baseText = "";
    switch (status) {
      case 'running':
        baseText = 'Instance Running';
        break;
      case 'stopped':
        baseText = 'Instance Stopped';
        break;
      case 'pending':
        baseText = 'Instance Starting...';
        break;
      case 'stopping':
        baseText = 'Instance Stopping...';
        break;
      case 'unknown':
      default:
        baseText = 'Instance Status Unknown';
        break;
    }
    
    return isFresh ? baseText : `${baseText} (Outdated)`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
      <span className={cn(
        "text-sm font-medium",
        !isFresh && "text-gray-500"
      )}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default StatusIndicator;
