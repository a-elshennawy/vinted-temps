import { CiBookmarkCheck } from "react-icons/ci";
import { useState } from "react";
import { supabase } from "../../supabase";
import BtnLoader from "./UI/BtnLoader";
import useMobile from "../Hooks/useMobile";
import { AnimatePresence, motion as Motion } from "motion/react";
import correctIcon from "../../assets/imgs/correct.png";

function InputComp() {
  const [tempTitle, setTempTitle] = useState("");
  const [tempBody, setTempBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastShow, setToastShow] = useState(false);
  const isMobile = useMobile();

  const handleSave = async () => {
    if (!tempTitle.trim() || !tempBody.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("templates").insert([
      {
        title: tempTitle,
        body: tempBody,
        approval: false,
      },
    ]);

    setLoading(false);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2000);

    if (error) {
      setError(error.message);
      return;
    }

    setTempTitle("");
    setTempBody("");
  };

  return (
    <div className="inpComp col-xl-5 col-lg-5 col-md-5 col-sm-12 col-12">
      <AnimatePresence>
        {toastShow && (
          <Motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="submitToast"
          >
            sent for approval <img src={correctIcon} alt="icon" />
          </Motion.span>
        )}
      </AnimatePresence>
      <h3>add template</h3>

      <div className="inputField">
        <label>template title</label>
        <input
          type="text"
          placeholder="template title"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          required
        />
      </div>

      <div className="inputField">
        <label>template body</label>
        <textarea
          cols={isMobile ? 30 : 40}
          rows={5}
          placeholder="template body"
          value={tempBody}
          onChange={(e) => setTempBody(e.target.value)}
          required
        />
      </div>

      {error && <p style={{ color: "red", fontSize: "0.85rem" }}>{error}</p>}

      <div className="btnsField">
        <button
          className={`${loading || !tempTitle.trim() || !tempBody.trim() ? "disabledBtn" : ""}`}
          onClick={handleSave}
          disabled={loading || !tempTitle.trim() || !tempBody.trim()}
        >
          {loading ? (
            <>
              adding <BtnLoader />
            </>
          ) : (
            <>
              add <CiBookmarkCheck size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default InputComp;
