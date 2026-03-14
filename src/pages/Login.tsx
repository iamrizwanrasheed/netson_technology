import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // const [username, setUsername] = useState("cheeta96");
  // const [password, setPassword] = useState("F&jK@0BwI$S)kQ1FQI0wETF1");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "hsl(222, 47%, 6%)" }}>

      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(160,84%,39%) 1px, transparent 1px), linear-gradient(90deg, hsl(160,84%,39%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-15 blur-[120px]"
        style={{ background: "hsl(160, 84%, 39%)" }} />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-10 blur-[100px]"
        style={{ background: "hsl(200, 80%, 50%)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: "hsl(36, 100%, 50%)" }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              background: `hsl(160, 84%, ${40 + Math.random() * 30}%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card glow border effect */}
        <div className="absolute -inset-[1px] rounded-2xl opacity-30"
          style={{
            background: "linear-gradient(135deg, hsl(160,84%,39%), transparent 40%, transparent 60%, hsl(200,80%,50%))",
          }}
        />

        <div className="relative rounded-2xl p-8 sm:p-10"
          style={{ background: "hsl(222, 47%, 10%)", backdropFilter: "blur(20px)" }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-xl blur-lg opacity-40"
                style={{ background: "hsl(160, 84%, 39%)" }} />
              <div className="relative w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "white" }}>
                <img src="/logo.png" alt="Netson Technologies" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Netson Technologies</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(220, 20%, 55%)" }}>
              Client Portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm text-red-300 border border-red-500/20"
              style={{ background: "hsl(0, 50%, 15%)" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{ color: "hsl(220, 20%, 55%)" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-[hsl(220,20%,35%)] outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: "hsl(222, 47%, 14%)",
                  border: "1px solid hsl(222, 30%, 20%)",
                  boxShadow: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(160, 84%, 39%)";
                  e.target.style.boxShadow = "0 0 0 3px hsl(160, 84%, 39%, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(222, 30%, 20%)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{ color: "hsl(220, 20%, 55%)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-lg text-sm text-white placeholder:text-[hsl(220,20%,35%)] outline-none transition-all duration-200"
                  style={{
                    background: "hsl(222, 47%, 14%)",
                    border: "1px solid hsl(222, 30%, 20%)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "hsl(160, 84%, 39%)";
                    e.target.style.boxShadow = "0 0 0 3px hsl(160, 84%, 39%, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "hsl(222, 30%, 20%)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ color: "hsl(220, 20%, 45%)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loading ? "hsl(160, 84%, 30%)" : "hsl(160, 84%, 39%)",
                boxShadow: loading ? "none" : "0 0 20px hsl(160, 84%, 39%, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.boxShadow = "0 0 30px hsl(160, 84%, 39%, 0.5)";
                  (e.target as HTMLButtonElement).style.background = "hsl(160, 84%, 44%)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.boxShadow = "0 0 20px hsl(160, 84%, 39%, 0.3)";
                  (e.target as HTMLButtonElement).style.background = "hsl(160, 84%, 39%)";
                }
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs" style={{ color: "hsl(220, 20%, 35%)" }}>
              Powered by Netson Technologies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
