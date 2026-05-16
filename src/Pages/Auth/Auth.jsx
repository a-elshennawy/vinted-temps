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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [toastShow, setToastShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlelogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("error logging in:", error.message);
      setError(error.message);
      setToastShow(true);
      setTimeout(() => {
        setToastShow(false);
      }, 2000);
      setLoading(false);
      return;
    }

    if (data.user) {
      navigate("/");
    }

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

        <form onSubmit={handlelogin} className="authForm">
          <h3>admin login</h3>
          <div className="inputField">
            <label>email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <RiEyeCloseLine size={20} />
              ) : (
                <RiEyeFill size={20} />
              )}
            </span>
          </div>
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
