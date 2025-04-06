
import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ActionButton from "@/components/ActionButton";

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  actionLabel: string;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  variant?: "default" | "destructive" | "success" | "outline" | "secondary" | "ghost" | "link";
}

const DashboardCard = ({
  title,
  icon,
  actionLabel,
  onClick,
  disabled,
  isLoading,
  variant = "default"
}: DashboardCardProps) => {
  return (
    <Card className={cn(
      "flex flex-col items-center justify-between p-6 transition-all",
      disabled ? "opacity-60 bg-slate-100" : "bg-white"
    )}>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      
      <div className="flex items-center justify-center my-8 text-4xl">
        {icon}
      </div>
      
      <ActionButton
        onClick={onClick}
        disabled={disabled}
        isLoading={isLoading}
        variant={variant}
        className="w-full"
      >
        {actionLabel}
      </ActionButton>
    </Card>
  );
};

export default DashboardCard;
