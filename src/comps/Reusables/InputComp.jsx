import { CiBookmarkCheck } from "react-icons/ci";
import { useState } from "react";
import { supabase } from "../../supabase";
import BtnLoader from "./UI/BtnLoader";
import useMobile from "../Hooks/useMobile";

function InputComp() {
  const [tempTitle, setTempTitle] = useState("");
  const [tempBody, setTempBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMobile();

  const handleSave = async () => {
    if (!tempTitle.trim() || !tempBody.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("templates").insert([
      {
        title: tempTitle,
        body: tempBody,
      },
    ]);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setTempTitle("");
    setTempBody("");
  };

  return (
    <div className="inpComp col-xl-5 col-lg-5 col-md-5 col-sm-12 col-12">
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
