import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CounterComp from "./CounterComp";
import { RiGeminiFill, RiLockPasswordFill } from "react-icons/ri";
// import Working from "./UI/Working";
import { BiSolidMessageRoundedCheck } from "react-icons/bi";
import { FaCopy, FaBookmark } from "react-icons/fa";
import BookMarks from "./BookMarks";
import PasswordsComp from "./PasswordsComp";
import TemplateInput from "./TemplateInput";
import { PiRankingFill } from "react-icons/pi";

function ControlComp() {
  const [whatComp, setWhatComp] = useState("counterComp");
  const navigate = useNavigate();
  const agentSession = localStorage.getItem("agentSession");

  return (
    <div className="ControlComp col-xl-5 col-lg-5 col-md-5 col-sm-12 col-12">
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

        {agentSession && (
          <>
            <button onClick={() => navigate("/agents-rank")}>
              rank <PiRankingFill />
            </button>
          </>
        )}
        <button
          onClick={() => setWhatComp("bookmarks")}
          className={`${whatComp === "bookmarks" ? "activeTab" : ""}`}
        >
          bookmarks <FaBookmark />
        </button>
        <button
          onClick={() => setWhatComp("passwords")}
          className={`${whatComp === "passwords" ? "activeTab" : ""}`}
        >
          passwords <RiLockPasswordFill />{" "}
        </button>
      </div>
      {whatComp === "counterComp" && <CounterComp />}
      {whatComp === "bookmarks" && <BookMarks />}
      {whatComp === "passwords" && <PasswordsComp />}
      {whatComp === "tempInput" && <TemplateInput />}
    </div>
  );
}

export default ControlComp;
