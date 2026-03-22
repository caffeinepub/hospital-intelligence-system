import type { Page } from "@/App";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";

const navItems: {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patients", label: "Patients", icon: Users },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-sidebar">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <HeartPulse className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground leading-tight">
            Hospital IQ
          </p>
          <p className="text-xs text-sidebar-accent-foreground">
            Intelligence System
          </p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-accent-foreground text-center">
          Hospital v1.0
        </p>
      </div>
    </aside>
  );
}
