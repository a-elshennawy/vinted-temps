import { MdClear } from "react-icons/md";
import { RiUserAddFill } from "react-icons/ri";
import { supabase } from "../../supabase";
import { useState } from "react";
import BtnLoader from "./UI/BtnLoader";
import { AnimatePresence, motion as Motion } from "motion/react";
import correctIcon from "../../assets/imgs/correct.png";
import { useEffect } from "react";

function AddNewAgent() {
  const [name, setName] = useState("");
  const [vintedEmail, setVintedEmail] = useState("");
  const [vintedId, setVintedId] = useState("");
  const [tl, setTl] = useState("");
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [toastShow, setToastShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim() || !vintedEmail.trim() || !vintedId.trim() || !tl.trim())
      return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("agents").insert([
      {
        name: name,
        email: vintedEmail,
        vinted_id: vintedId,
        replies: 0,
        TL: false,
        TeamLeader: tl,
      },
    ]);

    setLoading(false);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2000);

    if (error) {
      setError(error.message);
      return;
    }

    setName("");
    setVintedEmail("");
    setVintedId("");
    setTl("");
  };

  return (
    <>
      <AnimatePresence>
        {toastShow && (
          <Motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="agentSubmitToast"
          >
            {error ? (
              error
            ) : (
              <>
                added <img src={correctIcon} alt="icon" />
              </>
            )}
          </Motion.span>
        )}
      </AnimatePresence>
      <form className="agentForm" onSubmit={handleSave}>
        <div className="inputField">
          <label>name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="inputField">
          <label>vinted email</label>
          <input
            type="email"
            required
            value={vintedEmail}
            onChange={(e) => setVintedEmail(e.target.value)}
          />
        </div>
        <div className="inputField">
          <label>vinted ID</label>
          <input
            type="text"
            required
            value={vintedId}
            onChange={(e) => setVintedId(e.target.value)}
          />
        </div>
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
        <div className="actions">
          <button type="submit">
            {loading ? (
              <>
                adding <BtnLoader color="var(--first)" />
              </>
            ) : (
              <>
                add <RiUserAddFill size={20} />
              </>
            )}
          </button>
          <button type="reset">
            clear <MdClear size={20} />
          </button>
        </div>
      </form>
    </>
  );
}

export default AddNewAgent;
