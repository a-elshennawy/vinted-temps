import { FaEnvelope, FaHome } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../../supabase";
import logoutIcon from "../../assets/imgs/switch.png";
import NotificationDot from "./NotificationDot";
import { HiUserAdd } from "react-icons/hi";
import { BiUserCheck } from "react-icons/bi";
import { IoMdLogIn } from "react-icons/io";
import { PiRankingFill } from "react-icons/pi";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const agentSession = localStorage.getItem("agentSession");
  const agentName = agentSession ? JSON.parse(agentSession)?.name : null;

  return (
    <>
      <nav>
        {location.pathname === "/" && (
          <>
            {isLoggedIn && agentSession ? (
              <>
                <span onClick={handleLogout}>
                  <img src={logoutIcon} alt="logout" />
                </span>
                <button onClick={() => navigate("/pending")}>
                  <FaEnvelope size={24} />
                  <NotificationDot />
                </button>
                <button onClick={() => navigate("/agents")}>
                  <HiUserAdd size={24} />
                </button>
                <button onClick={() => navigate("/agents-rank")}>
                  <PiRankingFill size={24} />
                </button>
                <span className="agentName">
                  {agentName} <BiUserCheck size={24} />
                </span>
              </>
            ) : isLoggedIn ? (
              <>
                <span onClick={handleLogout}>
                  <img src={logoutIcon} alt="logout" />
                </span>
                <button onClick={() => navigate("/pending")}>
                  <FaEnvelope size={24} />
                  <NotificationDot />
                </button>
                <button onClick={() => navigate("/agents")}>
                  <HiUserAdd size={24} />
                </button>
                <button onClick={() => navigate("/agents-rank")}>
                  <PiRankingFill size={24} />
                </button>
                <Link className="toAgentLogin" to={`/auth/agent`}>
                  agent login <IoMdLogIn size={20} />
                </Link>
              </>
            ) : agentSession ? (
              <>
                <button onClick={() => navigate("/auth/admin")}>
                  <RiAdminLine size={24} />
                </button>
                <span className="agentName">
                  {agentName} <BiUserCheck size={24} />
                </span>
                <button onClick={() => navigate("/agents-rank")}>
                  <PiRankingFill size={24} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/auth/admin")}>
                  <RiAdminLine size={24} />
                </button>
                <Link className="toAgentLogin" to={`/auth/agent`}>
                  agent login <IoMdLogIn size={20} />
                </Link>
              </>
            )}
          </>
        )}
        {location.pathname === "/pending" && (
          <>
            <span onClick={handleLogout}>
              <img src={logoutIcon} alt="logout" />
            </span>
            <button onClick={() => navigate("/")}>
              <FaHome size={24} />
            </button>
            <button onClick={() => navigate("/agents")}>
              <HiUserAdd size={24} />
            </button>
          </>
        )}

        {location.pathname === "/agents" && (
          <>
            <span onClick={handleLogout}>
              <img src={logoutIcon} alt="logout" />
            </span>
            <button onClick={() => navigate("/")}>
              <FaHome size={24} />
            </button>
            <button onClick={() => navigate("/pending")}>
              <FaEnvelope size={24} />
              <NotificationDot />
            </button>
          </>
        )}

        {location.pathname === "/agents-rank" && (
          <>
            {isLoggedIn ? (
              <>
                <span onClick={handleLogout}>
                  <img src={logoutIcon} alt="logout" />
                </span>
                <button onClick={() => navigate("/pending")}>
                  <FaEnvelope size={24} />
                  <NotificationDot />
                </button>
                <button onClick={() => navigate("/agents")}>
                  <HiUserAdd size={24} />
                </button>
              </>
            ) : (
              <button onClick={() => navigate("/auth/admin")}>
                <RiAdminLine size={24} />
              </button>
            )}

            {agentSession ? (
              <>
                <span className="agentName">
                  {agentName} <BiUserCheck size={24} />
                </span>
              </>
            ) : (
              <>
                <Link className="toAgentLogin" to={`/auth/agent`}>
                  agent login <IoMdLogIn size={20} />
                </Link>
              </>
            )}

            <button onClick={() => navigate("/")}>
              <FaHome size={24} />
            </button>
          </>
        )}
      </nav>
    </>
  );
}

export default Navbar;
