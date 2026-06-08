import { FaCopy, FaCheck } from "react-icons/fa";
import { IoHeartCircle } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { AnimatePresence, motion as Motion } from "motion/react";
import NoTemplates from "./UI/NoTemplates";
import correctIcon from "../../assets/imgs/correct.png";
import Loader from "./UI/Loader";

function TempsList() {
  const [temps, setTemps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [toastShow, setToastShow] = useState(false);
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

  useEffect(() => {
    const fetchTemps = async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("approval", true)
        .order("created_at", { ascending: false });
      if (!error) setTemps(data);
      setLoading(false);
    };
    fetchTemps();

    const channel = supabase
      .channel("templates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "templates" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (payload.new.approval) {
              setTemps((prev) => [payload.new, ...prev]);
            }
          } else if (payload.eventType === "DELETE") {
            setTemps((prev) => prev.filter((t) => t.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setTemps((prev) => {
              if (!payload.new.approval) {
                return prev.filter((t) => t.id !== payload.new.id);
              }
              const exists = prev.some((t) => t.id === payload.new.id);
              if (exists) {
                return prev.map((t) =>
                  t.id === payload.new.id ? payload.new : t,
                );
              }
              return [payload.new, ...prev];
            });
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleCopy = async (temp) => {
    navigator.clipboard.writeText(temp.body).then(() => {
      setCopiedId(temp.id);
      setTimeout(() => setCopiedId(null), 2000);
    });

    // increase temp popularity in supabase by 1
    const updatedPopularity = temp.popularity + 1;
    await supabase
      .from("templates")
      .update({ popularity: updatedPopularity })
      .eq("id", temp.id);

    setToastShow(true);
    setTimeout(() => setToastShow(false), 2000);
  };

  const handleDelete = async (temp) => {
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", temp.id);

    if (error) {
      console.error("error deleting template:", error.message);
    }
  };

  const filtered = temps.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <AnimatePresence>
        {toastShow && (
          <Motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="copyToast"
          >
            template copied
            <img src={correctIcon} alt="correct" />
          </Motion.span>
        )}
      </AnimatePresence>

      <div className="tempsList col-xl-5 col-lg-5 col-md-5 col-sm-12 col-12">
        <input
          type="search"
          placeholder="search using template title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && <Loader size={200} color="var(--first)" />}
        {!loading && filtered.length === 0 && (
          <>
            <NoTemplates />
          </>
        )}
        <div className="temps">
          {filtered.map((temp) => (
            <div key={temp.id} className="temp">
              <div className="header">
                <h5>{temp.title}</h5>
                <div className="actions">
                  <span
                    onClick={() => handleCopy(temp)}
                    style={{ cursor: "pointer" }}
                    className="copyBtn"
                  >
                    {copiedId === temp.id ? (
                      <>
                        Copied
                        <FaCheck color="var(--first)" />
                      </>
                    ) : (
                      <>
                        Copy
                        <FaCopy color="var(--first)" />
                      </>
                    )}
                  </span>
                  {isLoggedIn && (
                    <>
                      <span title="Delete" onClick={() => handleDelete(temp)}>
                        <MdDelete size={24} color="var(--error)" />
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="line"></div>
              <div className="body">
                <p>{temp.body}</p>
              </div>
              {temp.popularity > 0 && (
                <div className="usedCount">
                  {temp.popularity}
                  <IoHeartCircle size={24} color="var(--first)" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default TempsList;
