import "./Auth.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiEyeFill, RiEyeCloseLine } from "react-icons/ri";
import { supabase } from "../../supabase";
import BtnLoader from "../../comps/Reusables/UI/BtnLoader";
import { AnimatePresence, motion as Motion } from "motion/react";
import { FaHome } from "react-icons/fa";
import errorIcon from "../../assets/imgs/cancel.png";

function Auth() {
  const [logType, setLogType] = useState("admin");

  // agent login
  const [vintedEmail, setVintedEmail] = useState("");
  const [vintedId, setVintedId] = useState("");

  // admin login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [toastShow, setToastShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showError = (msg) => {
    setError(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2000);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) navigate("/");
    setLoading(false);
  };

  const handleAgentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("agents")
      .select("name, email, vinted_id")
      .eq("email", vintedEmail.trim().toLowerCase())
      .eq("vinted_id", vintedId.trim())
      .single();

    if (error || !data) {
      showError("No agent found with these credentials.");
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "agentSession",
      JSON.stringify({
        name: data.name,
        email: data.email,
        vinted_id: data.vinted_id,
      }),
    );

    navigate("/");
    setLoading(false);
  };

  return (
    <>
      <title>Temp Store | Authentication</title>

      <div className="authPage">
        <AnimatePresence>
          {toastShow && (
            <Motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="errorToast"
            >
              {error} <img src={errorIcon} alt="error" />
            </Motion.span>
          )}
        </AnimatePresence>

        <button onClick={() => navigate("/")} className="homeBtn">
          <FaHome size={24} />
        </button>

        <div className="authSwitcher">
          <button
            onClick={() => setLogType("admin")}
            className={logType === "admin" ? "activeLogType" : ""}
          >
            admin login
          </button>
          <button
            onClick={() => setLogType("agent")}
            className={logType === "agent" ? "activeLogType" : ""}
          >
            agent login
          </button>
        </div>

        <form
          onSubmit={logType === "agent" ? handleAgentLogin : handleAdminLogin}
          className="authForm"
        >
          {logType === "agent" && (
            <>
              <div className="inputField">
                <label>vinted email</label>
                <input
                  type="email"
                  value={vintedEmail}
                  onChange={(e) => setVintedEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="line"></div>
              <div className="inputField">
                <label>vinted id</label>
                <input
                  type="text"
                  value={vintedId}
                  onChange={(e) => setVintedId(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </>
          )}

          {logType === "admin" && (
            <>
              <div className="inputField">
                <label>admin email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="line"></div>
              <div className="inputField">
                <label>password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <RiEyeCloseLine size={20} />
                  ) : (
                    <RiEyeFill size={20} />
                  )}
                </span>
              </div>
            </>
          )}

          <div className="loginField pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`${loading ? "disabledBtn" : ""}`}
            >
              {loading ? (
                <>
                  logging in <BtnLoader color="var(--first)" />
                </>
              ) : (
                <>login</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Auth;
