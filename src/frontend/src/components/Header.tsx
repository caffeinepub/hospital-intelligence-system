import type { Page } from "@/App";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { LogIn, LogOut } from "lucide-react";

const pageTitles: Record<Page, string> = {
  home: "Home",
  dashboard: "Dashboard",
  patients: "Patient Management",
  doctors: "Doctor Management",
  appointments: "Appointment System",
  analytics: "Analytics & Reports",
};

export default function Header({ activePage }: { activePage: Page }) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const initials = isLoggedIn
    ? identity.getPrincipal().toString().slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-xs">
      <h1 className="text-xl font-semibold text-foreground">
        {pageTitles[activePage]}
      </h1>
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-xs text-muted-foreground max-w-[120px] truncate">
                {identity.getPrincipal().toString().slice(0, 10)}…
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="gap-1.5"
              data-ocid="header.logout_button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="gap-1.5"
            data-ocid="header.login_button"
          >
            <LogIn className="h-4 w-4" />
            {isLoggingIn ? "Logging in…" : "Login"}
          </Button>
        )}
      </div>
    </header>
  );
}
