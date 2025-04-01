
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  variant?: "default" | "destructive" | "success" | "outline" | "secondary" | "ghost" | "link";
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const ActionButton = ({
  variant = "default",
  onClick,
  disabled = false,
  isLoading = false,
  children,
  className,
}: ActionButtonProps) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn("w-full flex items-center gap-2", className)}
    >
      {isLoading ? (
        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : null}
      {children}
    </Button>
  );
};

export default ActionButton;
