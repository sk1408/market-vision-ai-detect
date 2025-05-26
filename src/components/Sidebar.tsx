import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  ChartBar, 
  ChartLine, 
  ChartPie, 
  ChartCandlestick, 
  Database,
  FileText,
  FileSearch,
  Search,
  Settings,
  Bitcoin,
  DollarSign,
  IndianRupee,
  Brain
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className={`bg-sidebar border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <h1 className={`font-bold text-xl text-primary ${collapsed ? 'hidden' : 'block'}`}>NERUPULSE</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground"
          >
            {collapsed ? '→' : '←'}
          </Button>
        </div>
        
        <div className="p-2 flex-1 overflow-y-auto scrollbar-hide">
          <nav className="space-y-6">
            <div>
              <h2 className={`mb-2 px-2 text-xs uppercase text-muted-foreground ${collapsed ? 'sr-only' : ''}`}>
                Markets
              </h2>
              <div className="space-y-1">
                <SidebarLink icon={<IndianRupee size={20} />} label="Indian" to="/" collapsed={collapsed} />
                <SidebarLink icon={<DollarSign size={20} />} label="International" to="/international" collapsed={collapsed} />
                <SidebarLink icon={<Bitcoin size={20} />} label="Cryptocurrency" to="/crypto" collapsed={collapsed} />
              </div>
            </div>
            
            <div>
              <h2 className={`mb-2 px-2 text-xs uppercase text-muted-foreground ${collapsed ? 'sr-only' : ''}`}>
                Analysis
              </h2>
              <div className="space-y-1">
                <SidebarLink icon={<ChartLine size={20} />} label="Technical" to="/technical" collapsed={collapsed} />
                <SidebarLink icon={<ChartBar size={20} />} label="Fundamental" to="/fundamental" collapsed={collapsed} />
                <SidebarLink icon={<FileSearch size={20} />} label="Pattern Detection" to="/patterns" collapsed={collapsed} />
              </div>
            </div>
            
            <div>
              <h2 className={`mb-2 px-2 text-xs uppercase text-muted-foreground ${collapsed ? 'sr-only' : ''}`}>
                Predictions
              </h2>
              <div className="space-y-1">
                <SidebarLink icon={<ChartCandlestick size={20} />} label="AI Forecasts" to="/predictions" collapsed={collapsed} />
                <SidebarLink icon={<Database size={20} />} label="Training Models" to="/models" collapsed={collapsed} />
              </div>
            </div>
            
            <div>
              <h2 className={`mb-2 px-2 text-xs uppercase text-muted-foreground ${collapsed ? 'sr-only' : ''}`}>
                Other
              </h2>
              <div className="space-y-1">
                <SidebarLink icon={<Search size={20} />} label="Search" to="/search" collapsed={collapsed} />
                <SidebarLink icon={<FileText size={20} />} label="Reports" to="/reports" collapsed={collapsed} />
                <SidebarLink icon={<Settings size={20} />} label="Settings" to="/settings" collapsed={collapsed} />
              </div>
            </div>
          </nav>
        </div>
        
        <div className={`p-4 border-t border-border ${collapsed ? 'hidden' : 'block'}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-positive animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Vertex AI Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  collapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, to, collapsed }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent group transition-all"
    >
      <span>{icon}</span>
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <span className="fixed left-16 ml-6 px-2 py-1 rounded-md bg-popover text-popover-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity z-50">
          {label}
        </span>
      )}
    </Link>
  );
};

export default Sidebar;
