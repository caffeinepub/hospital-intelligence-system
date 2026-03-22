import type { Page } from "@/App";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  patients: "Patient Management",
  doctors: "Doctor Management",
  appointments: "Appointment System",
  analytics: "Analytics & Reports",
};

export default function Header({ activePage }: { activePage: Page }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-xs">
      <h1 className="text-xl font-semibold text-foreground">
        {pageTitles[activePage]}
      </h1>
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-ocid="header.search_input"
            placeholder="Search..."
            className="pl-9 h-9 bg-background text-sm"
          />
        </div>
        <button
          type="button"
          data-ocid="header.notifications.button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted transition-colors"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
