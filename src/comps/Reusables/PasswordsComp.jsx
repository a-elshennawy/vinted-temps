import { useState, useEffect } from "react";
import Nothing from "./UI/Nothing";
import { supabase } from "../../supabase";
import { TiDelete } from "react-icons/ti";
import { FaCopy, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import Loader from "../Reusables/UI/Loader";
import {
  encryptPassword,
  decryptPassword,
  maskPassword,
} from "../../Functions/Helpers";
import BtnLoader from "./UI/BtnLoader";
import Locked from "./UI/Locked";
import { Link } from "react-router-dom";
import { RiAdminFill } from "react-icons/ri";

function PasswordsComp() {
  const agentSession = localStorage.getItem("agentSession");
  const agentName = agentSession ? JSON.parse(agentSession)?.name : null;
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPasswords, setLoadingPasswords] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState(new Set());
  // const [secret, setSecret] = useState("");
  const [title, setTitle] = useState("");
  const [user, setUser] = useState("");
  const [copiedUserId, setCopiedUserId] = useState(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState(null);

  const getPasswords = async () => {
    if (!agentSession) return;

    const { data, error } = await supabase
      .from("passwords")
      .select("*")
      .eq("owner", agentName);

    if (error) {
      console.error("fetch passwords error:", error);
      return;
    }

    setPasswords(data || []);
    setLoadingPasswords(false);
  };

  useEffect(() => {
    if (agentSession) {
      setTimeout(() => {
        getPasswords();
      }, 0);
    }
  });

  useEffect(() => {
    if (!agentSession || !agentName) return;

    const channel = supabase
      .channel(`passwords-${agentName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "passwords",
          filter: `owner=eq.${agentName}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPasswords((prev) =>
              prev.some((t) => t.id === payload.new.id)
                ? prev
                : [...prev, payload.new],
            );
          } else if (payload.eventType === "UPDATE") {
            setPasswords((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t)),
            );
          } else if (payload.eventType === "DELETE") {
            setPasswords((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentSession, agentName]);

  const HandleAddPassword = async (e) => {
    e.preventDefault();
    if (!title || !password) return;
    setLoading(true);

    const encryptedPass = encryptPassword(password);
    const newPassword = {
      owner: agentName,
      user: user.trim() || null,
      password: encryptedPass,
      title: title.trim(),
    };

    const { data, error } = await supabase
      .from("passwords")
      .insert([{ ...newPassword }])
      .select();

    if (error) {
      console.error("insert error:", error);
    } else if (data?.length) {
      setPasswords((prev) => [...prev, data[0]]);
    }

    setTitle("");
    setPassword("");
    setUser("");
    setLoading(false);
  };

  const handleCopyPassword = (id) => {
    const password = passwords.find((pass) => pass.id === id)?.password;
    if (password) {
      navigator.clipboard.writeText(decryptPassword(password));
      setCopiedPasswordId(id);
    }

    setTimeout(() => {
      setCopiedPasswordId((current) => (current === id ? null : current));
    }, 2000);
  };

  const handleCopyUser = (id) => {
    const user = passwords.find((pass) => pass.id === id)?.user;
    if (user) {
      navigator.clipboard.writeText(user);
      setCopiedUserId(id);
    }

    setTimeout(() => {
      setCopiedUserId((current) => (current === id ? null : current));
    }, 2000);
  };

  const handleDeletePassword = async (id) => {
    setLoadingPasswords(true);
    const { error } = await supabase.from("passwords").delete().eq("id", id);

    if (error) {
      console.error("delete error:", error);
    } else {
      setPasswords((prev) => prev.filter((pass) => pass.id !== id));
    }

    setLoadingPasswords(false);
  };

  const togglePasswordMask = (id) => {
    setVisiblePasswordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <div className="passwordsComp">
        {!agentSession ? (
          <>
            <Locked />
            <div className="lockedDiv">
              <h4>This feature is only available for agnets</h4>
              <button>
                <Link to="/auth/agent">
                  Login / Register <RiAdminFill size={20} />
                </Link>
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={HandleAddPassword}>
              <div className="inputField">
                <input
                  type="text"
                  placeholder="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="inputField">
                <input
                  type="text"
                  placeholder="username / email"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
              <div className="inputField">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <FaEyeSlash color="var(--first)" size={20} />
                  ) : (
                    <FaEye color="var(--first)" size={20} />
                  )}
                </span>
              </div>
              <div className="action">
                <button type="submit">
                  {loading ? (
                    <>
                      Saving <BtnLoader color="var(--first)" />
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
            {loadingPasswords ? (
              <Loader color="var(--first)" />
            ) : (
              passwords.length === 0 && <Nothing />
            )}

            {passwords.length > 0 && (
              <>
                <div className="passwordsList">
                  {passwords.map((pass) => (
                    <>
                      <div className="passItem" key={pass.id}>
                        <div className="header">
                          <h6>{pass.title}</h6>
                          <span onClick={() => handleDeletePassword(pass.id)}>
                            <TiDelete size={22} />
                          </span>
                        </div>
                        <div className="line"></div>
                        <div className="body">
                          <div className="passDetails">
                            {pass?.user && (
                              <>
                                <p>{pass.user}</p>
                                <div className="actions">
                                  <span onClick={() => handleCopyUser(pass.id)}>
                                    {copiedUserId === pass.id ? (
                                      <FaCheck />
                                    ) : (
                                      <FaCopy />
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="passDetails">
                            <p>
                              {visiblePasswordIds.has(pass.id)
                                ? decryptPassword(pass.password)
                                : maskPassword(decryptPassword(pass.password))}
                            </p>
                            <div className="actions">
                              <span onClick={() => togglePasswordMask(pass.id)}>
                                {visiblePasswordIds.has(pass.id) ? (
                                  <FaEyeSlash />
                                ) : (
                                  <FaEye />
                                )}
                              </span>
                              <span onClick={() => handleCopyPassword(pass.id)}>
                                {copiedPasswordId === pass.id ? (
                                  <FaCheck />
                                ) : (
                                  <FaCopy />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default PasswordsComp;
