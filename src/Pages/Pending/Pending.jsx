import "./Pending.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import Loader from "../../comps/Reusables/UI/Loader";
import approveIcon from "../../assets/imgs/correct.png";
import deleteIcon from "../../assets/imgs/cancel.png";
import NoPending from "../../comps/Reusables/UI/NoPending";
import { AnimatePresence, motion as Motion } from "motion/react";

function Pending() {
  const [temps, setTemps] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [ApprovedToastShow, setApprovedToastShow] = useState(false);
  const [RejectedToastShow, setRejectedToastShow] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchTemps = async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("approval", false)
        .order("created_at", { ascending: false });
      if (!error) setTemps(data);
      setLoading(false);
    };
    fetchTemps();

    const channel = supabase
      .channel("pending-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "templates" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (!payload.new.approval) {
              setTemps((prev) => [payload.new, ...prev]);
            }
          } else if (payload.eventType === "DELETE") {
            setTemps((prev) => prev.filter((t) => t.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setTemps((prev) => prev.filter((t) => t.id !== payload.new.id));
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  if (loading || !user) {
    <Loader />;
  }

  const handleDelete = async (temp) => {
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", temp.id);

    setRejectedToastShow(true);
    setTimeout(() => setRejectedToastShow(false), 2000);

    if (error) {
      console.error("error deleting template:", error.message);
    }
  };

  const handleApprove = async (temp) => {
    const { error } = await supabase
      .from("templates")
      .update({ approval: true })
      .eq("id", temp.id);

    setApprovedToastShow(true);
    setTimeout(() => setApprovedToastShow(false), 2000);

    if (error) {
      console.error("error approving template:", error.message);
    }
  };

  return (
    <>
      <title>Temp Store | Pending Approvals</title>
      <div className="row justify-content-center align-items-start m-0 gap-1 py-3 px-2">
        <AnimatePresence>
          {ApprovedToastShow && (
            <Motion.span
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="approvedToast"
            >
              Approved <img src={approveIcon} alt="approved" />
            </Motion.span>
          )}
          {RejectedToastShow && (
            <Motion.span
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="deletedToast"
            >
              Deleted <img src={deleteIcon} alt="deleted" />
            </Motion.span>
          )}
        </AnimatePresence>
        {temps.length === 0 ? (
          <>
            <div className="col-10">
              <NoPending />
            </div>
          </>
        ) : (
          temps.map((temp) => (
            <div
              key={temp.id}
              className="pendingTemp col-xl-4 col-lg-4 col-md-5 col-sm-10 col-12"
            >
              <div className="header">
                <h5>{temp.title}</h5>
              </div>
              <div className="line"></div>
              <div className="body">
                <p>{temp.body}</p>
              </div>
              <div className="line"></div>
              <div className="actions pt-2">
                <button onClick={() => handleApprove(temp)}>
                  approve <img src={approveIcon} alt="approve" />
                </button>
                <button onClick={() => handleDelete(temp)}>
                  delete <img src={deleteIcon} alt="delete" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Pending;
