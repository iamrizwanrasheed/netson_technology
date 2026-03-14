import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, ListChecks, BarChart3, CalendarDays, PhoneCall,
  ShoppingBag, UserCircle, LogOut, X, Zap,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Plan Progress", url: "/plan", icon: ListChecks },
  { title: "Usage Analytics", url: "/usage", icon: BarChart3 },
  { title: "Appointments", url: "/appointments", icon: CalendarDays },
  { title: "Call Analytics", url: "/calls", icon: PhoneCall },
  { title: "My Orders", url: "/orders", icon: ShoppingBag },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={onClose} />
      <aside className="fixed inset-y-0 left-0 z-50 w-64 sidebar-bg lg:hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold text-sidebar-primary-foreground">ClientHub</h1>
          </div>
          <button onClick={onClose} className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/"}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                activeClassName="bg-primary/15 text-primary font-medium"
                onClick={onClose}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <NavLink
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-colors ${
              location.pathname === "/profile"
                ? ""
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
            activeClassName="bg-primary/15 text-primary font-medium"
            onClick={onClose}
          >
            <UserCircle className="w-[18px] h-[18px]" />
            <span>Profile</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Log Out</span>
          </button>
        </div>

        {user && (
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  {user.display_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-primary-foreground truncate">{user.display_name}</p>
                <p className="text-[11px] text-sidebar-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
