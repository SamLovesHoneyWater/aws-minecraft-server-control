
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isFresh: boolean;
}

const RefreshButton = ({ onClick, isLoading, isFresh }: RefreshButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-md transition-colors shadow-md font-medium text-base",
        !isFresh 
          ? "bg-primary text-white animate-pulse hover:bg-primary/90" 
          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
        "disabled:opacity-70"
      )}
    >
      <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
      {isLoading ? 'Refreshing...' : isFresh ? 'Refresh Status' : 'Status Outdated - Click to Refresh'}
    </button>
  );
};

export default RefreshButton;
