import { FaCopy, FaCheck } from "react-icons/fa";
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

  useEffect(() => {
    const fetchTemps = async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
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
            setTemps((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setTemps((prev) => prev.filter((t) => t.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setTemps((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t)),
            );
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleCopy = (temp) => {
    navigator.clipboard.writeText(temp.body).then(() => {
      setCopiedId(temp.id);
      setTimeout(() => setCopiedId(null), 2000);
    });

    setToastShow(true);
    setTimeout(() => setToastShow(false), 2000);
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
        <h3>saved templates</h3>
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
        {filtered.map((temp) => (
          <div key={temp.id} className="temp">
            <div className="header">
              <h5>{temp.title}</h5>
              <span
                onClick={() => handleCopy(temp)}
                style={{ cursor: "pointer" }}
                title="Copy"
              >
                {copiedId === temp.id ? (
                  <FaCheck color="var(--white)" />
                ) : (
                  <FaCopy color="var(--white)" />
                )}
              </span>
            </div>
            <div className="body">
              <p>{temp.body}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default TempsList;
