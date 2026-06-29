import { CiBookmarkCheck } from "react-icons/ci";
import { useState } from "react";
import { supabase } from "../../supabase";
import BtnLoader from "./UI/BtnLoader";
import useMobile from "../Hooks/useMobile";
import { AnimatePresence, motion as Motion } from "motion/react";
import correctIcon from "../../assets/imgs/correct.png";
import CounterComp from "./CounterComp";
import RephraseTool from "./RephraseTool";
import { RiGeminiFill } from "react-icons/ri";
import { CgPerformance } from "react-icons/cg";
// import Working from "./UI/Working";
import Performance from "./Performance";
import { BiSolidMessageRoundedCheck } from "react-icons/bi";
import { FaCopy } from "react-icons/fa";
import BookMarks from "./BookMarks";
import { IoTicketSharp } from "react-icons/io5";

function InputComp() {
  const [whatComp, setWhatComp] = useState("counterComp");
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
      <div className="tabSwitch">
        <button
          onClick={() => setWhatComp("tempInput")}
          className={`${whatComp === "tempInput" ? "activeTab" : ""}`}
        >
          Add <FaCopy />
        </button>
        <button
          onClick={() => setWhatComp("counterComp")}
          className={`${whatComp === "counterComp" ? "activeTab" : ""}`}
        >
          counter <BiSolidMessageRoundedCheck />
        </button>
        <button
          onClick={() => setWhatComp("rephraseTool")}
          className={`${whatComp === "rephraseTool" ? "activeTab" : ""}`}
        >
          rephrase <RiGeminiFill />
        </button>
        <button
          onClick={() => setWhatComp("performance")}
          className={`${whatComp === "performance" ? "activeTab" : ""}`}
        >
          performance <CgPerformance />
        </button>
        <button
          onClick={() => setWhatComp("bookmarks")}
          className={`${whatComp === "bookmarks" ? "activeTab" : ""}`}
        >
          bookmarks <IoTicketSharp />
        </button>
      </div>
      {whatComp === "rephraseTool" && <RephraseTool />}
      {whatComp === "counterComp" && <CounterComp />}
      {whatComp === "performance" && <Performance />}
      {whatComp === "bookmarks" && <BookMarks />}
      {whatComp === "tempInput" && (
        <>
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

          {error && (
            <p style={{ color: "red", fontSize: "0.85rem" }}>{error}</p>
          )}

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
        </>
      )}
    </div>
  );
}

export default InputComp;
