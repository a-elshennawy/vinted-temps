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
import { SiVinted } from "react-icons/si";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agent, setAgent] = useState(() => {
    const s = localStorage.getItem("agentSession");
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    if (!agent?.email) return;

    const syncAgent = async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("name, email, vinted_id, TL")
        .eq("email", agent.email)
        .single();

      if (!error && data) {
        localStorage.setItem("agentSession", JSON.stringify(data));
        setAgent(data);
      }
    };
    syncAgent();

    const channel = supabase
      .channel("agent-tl-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "agents",
          filter: `email=eq.${agent.email}`,
        },
        (payload) => {
          localStorage.setItem("agentSession", JSON.stringify(payload.new));
          setAgent(payload.new);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [agent?.email]);
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
  const isTl = agent?.TL;

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

        {location.pathname === "/tls-tools" && (
          <>
            <button onClick={() => navigate("/")}>
              <FaHome size={24} />
            </button>
          </>
        )}

        {location.pathname !== "/tls-tools" && (
          <>
            {isTl && (
              <>
                <button
                  className="tlToolsBtns"
                  onClick={() => navigate("/tls-tools")}
                >
                  TL Tools <SiVinted color="var(--first)" />
                </button>
              </>
            )}
          </>
        )}
      </nav>
    </>
  );
}

export default Navbar;
