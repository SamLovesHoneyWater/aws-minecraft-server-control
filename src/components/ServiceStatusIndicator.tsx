
import { cn } from "@/lib/utils";

interface ServiceStatusIndicatorProps {
  status: 'running' | 'stopped' | 'unknown';
  className?: string;
  isFresh: boolean;
}

const ServiceStatusIndicator = ({ status, className, isFresh }: ServiceStatusIndicatorProps) => {
  const getStatusColor = () => {
    if (!isFresh) return 'bg-gray-400';
    
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'unknown':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    let baseText = "";
    switch (status) {
      case 'running':
        baseText = 'Running';
        break;
      case 'stopped':
        baseText = 'Stopped';
        break;
      case 'unknown':
      default:
        baseText = 'Unknown';
        break;
    }
    
    return isFresh ? baseText : `Outdated (Was: ${baseText})`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
      <span className="text-sm font-medium">{getStatusText()}</span>
    </div>
  );
};

export default ServiceStatusIndicator;
