import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import LoadingButton from "../components/LoadingButton";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    curriculum: "WAEC"
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const register = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      await api.post("/auth/register", form);

      alert("Account created successfully.");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100";

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">

      <form
        onSubmit={register}
        className="w-full rounded-2xl border bg-white p-8 shadow-md"
      >

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Start your AI-powered learning journey
          </p>
        </div>

        {/* FORM */}
        <div className="mt-6 space-y-4">

          {/* FULL NAME */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Full Name
            </label>
            <input
              className={inputClass}
              placeholder="John Doe"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              className={inputClass}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Password
            </label>

            <div className="relative">
              <input
                className={inputClass + " pr-10"}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CURRICULUM */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Curriculum
            </label>

            <select
              className={inputClass}
              value={form.curriculum}
              onChange={(e) =>
                setForm({ ...form, curriculum: e.target.value })
              }
            >
              <option value="WAEC">WAEC</option>
              <option value="NECO">NECO</option>
              <option value="JAMB">JAMB</option>
              <option value="BECE">BECE</option>
              <option value="GCE">GCE</option>
            </select>
          </div>

          {/* SUBMIT */}
          <LoadingButton
            loading={loading}
            loadingText="Creating account..."
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700"
            type="submit"
          >
            Create Account
          </LoadingButton>
        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}