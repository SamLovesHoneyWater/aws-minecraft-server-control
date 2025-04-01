
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EC2Dashboard from "@/components/EC2Dashboard";
import { clearUser } from "@/utils/auth";
import { LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      <header className="p-4 border-b bg-white flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-800">Cloud Ninja Controls</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <EC2Dashboard />
      </main>
      
      <footer className="p-3 text-center text-sm text-slate-500">
        EC2 Instance Control Panel
      </footer>
    </div>
  );
};

export default Index;
