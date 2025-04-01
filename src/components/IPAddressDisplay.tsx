
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Copy } from "lucide-react";

interface IPAddressDisplayProps {
  ipAddress: string | null;
  isLoading: boolean;
}

const IPAddressDisplay = ({ ipAddress, isLoading }: IPAddressDisplayProps) => {
  const [copyLoading, setCopyLoading] = useState(false);

  const copyToClipboard = async () => {
    if (!ipAddress) return;
    
    try {
      setCopyLoading(true);
      await navigator.clipboard.writeText(ipAddress);
      toast.success("IP address copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy IP address");
      console.error("Copy failed:", error);
    } finally {
      setCopyLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Instance IP Address</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-6 w-full bg-muted animate-pulse rounded-md" />
          ) : ipAddress ? (
            <>
              <code className="bg-muted px-3 py-1 rounded-md flex-grow text-center">
                {ipAddress}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                disabled={copyLoading}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No IP address available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IPAddressDisplay;
