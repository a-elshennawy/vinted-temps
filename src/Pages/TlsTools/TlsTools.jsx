import "./TlsTools.css";
import Working from "../../comps/Reusables/UI/Working";
import { useState } from "react";
import { AiOutlineTeam } from "react-icons/ai";
import { SiGoogletasks } from "react-icons/si";
import { MdEventBusy } from "react-icons/md";

function TlTools() {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <>
      <div className="tlPage py-3">
        <div className="switcher py-2">
          <button onClick={() => setActiveTab("coaching")}>
            coaching counter <MdEventBusy size={18} />
          </button>
          <button onClick={() => setActiveTab("tasks")}>
            tasks <SiGoogletasks size={18} />
          </button>
          <button onClick={() => setActiveTab("agents")}>
            my agents <AiOutlineTeam size={18} />
          </button>
        </div>
        <Working />
      </div>
    </>
  );
}

export default TlTools;
