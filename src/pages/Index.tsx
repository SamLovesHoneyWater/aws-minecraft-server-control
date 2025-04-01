
import EC2Dashboard from "@/components/EC2Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      <header className="p-4 border-b bg-white">
        <h1 className="text-center text-2xl font-semibold text-slate-800">Cloud Ninja Controls</h1>
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
