import "./Auth.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RiEyeFill, RiEyeCloseLine } from "react-icons/ri";
import { supabase } from "../../supabase";
import BtnLoader from "../../comps/Reusables/UI/BtnLoader";
import { AnimatePresence, motion as Motion } from "motion/react";
import { FaHome } from "react-icons/fa";
import errorIcon from "../../assets/imgs/cancel.png";
import { useEffect } from "react";

function Auth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { logType } = useParams();
  const navigate = useNavigate();
  const setLogType = (type) => navigate(`/auth/${type}`);

  // agent register
  const [agentName, setAgentName] = useState("");
  const [tl, setTl] = useState("");

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

  const [teamLeaders, setTeamLeaders] = useState([]);

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

  const getTeamleaders = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("TL", true);

    if (error) {
      setError(error.message);
      return;
    }

    setTeamLeaders(data);
  };

  useEffect(() => {
    setTimeout(() => {
      getTeamleaders();
    }, 0);
  }, []);

  const handleAgentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("agents")
      .select("name, email, vinted_id, TL")
      .eq("email", vintedEmail.trim().toLowerCase())
      .eq("vinted_id", vintedId.trim())
      .single();

    if (error || !data) {
      showError("New Agent ?");
      setLoading(false);
      setLogType("new_agent");
      return;
    }

    localStorage.setItem(
      "agentSession",
      JSON.stringify({
        name: data.name,
        email: data.email,
        vinted_id: data.vinted_id,
        TL: data.TL,
      }),
    );

    navigate("/");
    setLoading(false);
  };

  const handleAgentReg = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("agents")
      .insert([
        {
          name: agentName,
          email: vintedEmail.trim().toLowerCase(),
          vinted_id: vintedId.trim(),
          replies: 0,
          TL: false,
          TeamLeader: tl,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      showError("Contact Support");
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "agentSession",
      JSON.stringify({
        name: data.name,
        email: data.email,
        vinted_id: data.vinted_id,
        TL: data.TL,
      }),
    );

    navigate("/");
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const agentSession = localStorage.getItem("agentSession");

  return (
    <>
      <title>Vinted Internal | Authentication</title>

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
          {!agentSession && (
            <>
              {!isLoggedIn && (
                <button
                  onClick={() => setLogType("admin")}
                  className={logType === "admin" ? "activeLogType" : ""}
                >
                  admin login
                </button>
              )}
              <button
                onClick={() => setLogType("agent")}
                className={logType === "agent" ? "activeLogType" : ""}
              >
                agent login
              </button>
              <button
                onClick={() => setLogType("new_agent")}
                className={logType === "new_agent" ? "activeLogType" : ""}
              >
                agent register
              </button>
            </>
          )}
        </div>

        <form
          onSubmit={
            logType === "admin"
              ? handleAdminLogin
              : logType === "agent"
                ? handleAgentLogin
                : handleAgentReg
          }
          className="authForm"
        >
          {logType === "agent" && (
            <>
              <div className="inputField">
                <label>vinted email (@vinted.com)</label>
                <input
                  type="email"
                  value={vintedEmail}
                  onChange={(e) => setVintedEmail(e.target.value)}
                  required
                  autoComplete="email"
                  pattern="[a-zA-Z0-9._%+-]+@vinted\.com"
                  placeholder="agent.name@vinted.com"
                />
              </div>
              <div className="line"></div>
              <div className="inputField">
                <label>vinted id (not the one on your id)</label>
                <input
                  type="text"
                  value={vintedId}
                  onChange={(e) => setVintedId(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="ex: 15496"
                />
              </div>
            </>
          )}

          {logType === "new_agent" && (
            <>
              <span className="noteSpan mb-3">
                Kindly use your vinted account details
              </span>
              <div className="inputField">
                <label>agent full name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                />
              </div>
              <div className="line"></div>
              <div className="inputField">
                <label>vinted email (@vinted.com)</label>
                <input
                  type="email"
                  value={vintedEmail}
                  onChange={(e) => setVintedEmail(e.target.value)}
                  required
                  autoComplete="email"
                  pattern="[a-zA-Z0-9._%+-]+@vinted\.com"
                  placeholder="agent.name@vinted.com"
                />
              </div>
              <div className="line"></div>
              <div className="inputField">
                <label>vinted id (not the one on your id)</label>
                <input
                  type="text"
                  value={vintedId}
                  onChange={(e) => setVintedId(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="ex: 15496"
                />
              </div>
              <div className="line"></div>
              <div className="inputField">
                <label>team leader</label>
                <select value={tl} onChange={(e) => setTl(e.target.value)}>
                  <option>select your TL</option>
                  {teamLeaders.map((leader) => (
                    <option key={leader.id} value={leader.name}>
                      {leader.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="line"></div>
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
