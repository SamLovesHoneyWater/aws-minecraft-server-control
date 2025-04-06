
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
        "flex items-center gap-1 px-3 py-2 rounded-md transition-colors",
        !isFresh ? "text-primary font-medium bg-blue-50 hover:bg-blue-100" : "text-muted-foreground hover:bg-slate-100"
      )}
    >
      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
      {isLoading ? 'Refreshing...' : 'Refresh Status'}
    </button>
  );
};

export default RefreshButton;
