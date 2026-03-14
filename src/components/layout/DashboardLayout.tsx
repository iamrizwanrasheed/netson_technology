import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm outline-none w-48 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              {user?.avatar ? (
                <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {initials}
                </div>
              )}
              <div className="text-right">
                <p className="text-xs font-medium">{user?.display_name || "User"}</p>
                <p className="text-[10px] text-muted-foreground">{user?.role || ""}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>

          {rightPanel && (
            <aside className="hidden xl:block w-80 border-l border-border bg-card overflow-y-auto p-5">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
