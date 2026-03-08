import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      localStorage.setItem("admin_token", response.data.token);
      toast.success("Login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6" data-testid="admin-login-page">
      <div className="w-full max-w-sm">
        <form onSubmit={handleLogin} className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-zinc-400" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-sm text-zinc-500">Enter your password to continue</p>
          </div>
          
          <div className="relative mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-14 px-5 bg-transparent border border-white/10 rounded-full text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none transition-colors text-center"
              autoFocus
              data-testid="password-input"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-black font-medium rounded-full flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="login-button"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                Enter <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors" data-testid="back-to-resume-link">
            Back to Resume
          </a>
        </div>
      </div>
    </div>
  );
}
