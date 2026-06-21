import { MdClear } from "react-icons/md";
import { RiUserAddFill } from "react-icons/ri";
import { supabase } from "../../supabase";
import { useState } from "react";
import BtnLoader from "./UI/BtnLoader";
import { AnimatePresence, motion as Motion } from "motion/react";
import correctIcon from "../../assets/imgs/correct.png";

function AddNewAgent() {
  const [name, setName] = useState("");
  const [vintedEmail, setVintedEmail] = useState("");
  const [twwId, setTwwId] = useState("");
  const [vintedId, setVintedId] = useState("");
  const [tl, setTl] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !vintedEmail.trim() ||
      !twwId.trim() ||
      !vintedId.trim() ||
      !tl.trim()
    )
      return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("agents").insert([
      {
        name: name,
        email: vintedEmail,
        tww_id: twwId,
        vinted_id: vintedId,
        team_leader: tl,
        spec: "S&D",
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
    setTwwId("");
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
          <label>TWW ID</label>
          <input
            type="text"
            required
            value={twwId}
            onChange={(e) => setTwwId(e.target.value)}
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
          <label>TL</label>
          <input
            type="text"
            required
            value={tl}
            onChange={(e) => setTl(e.target.value)}
          />
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
