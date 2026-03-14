import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  CalendarDays,
  PhoneCall,
  ShoppingBag,
  UserCircle,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Plan Progress", url: "/plan", icon: ListChecks },
  { title: "Usage Analytics", url: "/usage", icon: BarChart3 },
  { title: "Appointments", url: "/appointments", icon: CalendarDays },
  { title: "Call Analytics", url: "/calls", icon: PhoneCall },
  { title: "My Orders", url: "/orders", icon: ShoppingBag },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sidebar-bg border-r border-sidebar-border shrink-0 sticky top-0 overflow-y-auto overflow-x-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
          <img src="/logo.png" alt="ClientHub" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-primary-foreground tracking-tight">Netson Technologies</h1>
          <p className="text-[11px] text-sidebar-foreground/60">AI Services Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive
                ? ""
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              activeClassName="bg-primary/15 text-primary font-medium"
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-colors ${location.pathname === "/profile"
            ? ""
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          activeClassName="bg-primary/15 text-primary font-medium"
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

      {/* User */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-primary-foreground truncate">
              {user?.display_name || "User"}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
