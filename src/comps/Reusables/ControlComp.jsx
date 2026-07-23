import { useState } from "react";
import CounterComp from "./CounterComp";
import RephraseTool from "./RephraseTool";
import { RiGeminiFill, RiLockPasswordFill } from "react-icons/ri";
// import Working from "./UI/Working";
import Performance from "./Performance";
import { BiSolidMessageRoundedCheck } from "react-icons/bi";
import { FaCopy, FaBookmark, FaChartLine } from "react-icons/fa";
import BookMarks from "./BookMarks";
import PasswordsComp from "./PasswordsComp";
import TemplateInput from "./TemplateInput";

function ControlComp() {
  const [whatComp, setWhatComp] = useState("counterComp");

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
          performance <FaChartLine />
        </button>
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
      {whatComp === "rephraseTool" && <RephraseTool />}
      {whatComp === "counterComp" && <CounterComp />}
      {whatComp === "performance" && <Performance />}
      {whatComp === "bookmarks" && <BookMarks />}
      {whatComp === "passwords" && <PasswordsComp />}
      {whatComp === "tempInput" && <TemplateInput />}
    </div>
  );
}

export default ControlComp;
