
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: 'running' | 'stopped' | 'pending' | 'stopping' | 'unknown';
  className?: string;
}

const StatusIndicator = ({ status, className }: StatusIndicatorProps) => {
  const getStatusColor = () => {
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
    switch (status) {
      case 'running':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      case 'pending':
        return 'Starting...';
      case 'stopping':
        return 'Stopping...';
      case 'unknown':
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
      <span className="text-sm font-medium">{getStatusText()}</span>
    </div>
  );
};

export default StatusIndicator;
