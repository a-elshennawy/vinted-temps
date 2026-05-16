import { FaEnvelope, FaHome } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";
import logoutIcon from "../../assets/imgs/switch.png";
import NotificationDot from "./NotificationDot";

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

  return (
    <>
      <nav>
        {location.pathname === "/" && (
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
              </>
            ) : (
              <button onClick={() => navigate("/auth")}>
                <RiAdminLine size={24} />
              </button>
            )}
          </>
        )}

        {location.pathname === "/pending" && (
          <>
            {isLoggedIn ? (
              <span onClick={handleLogout}>
                <img src={logoutIcon} alt="logout" />
              </span>
            ) : (
              <button onClick={() => navigate("/auth")}>
                <RiAdminLine size={24} />
              </button>
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
