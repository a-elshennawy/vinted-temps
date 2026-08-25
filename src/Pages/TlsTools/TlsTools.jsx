import "./TlsTools.css";
import Working from "../../comps/Reusables/UI/Working";
import { useState } from "react";
import { AiOutlineTeam } from "react-icons/ai";
import { SiGoogletasks } from "react-icons/si";
import { MdEventBusy } from "react-icons/md";
import Tasks from "./SubComps/Tasks";

function TlTools() {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <>
      <div className="tlPage py-3">
        <div className="switcher py-2">
          <button
            className={`${activeTab === "coaching" ? "activeTab" : ""}`}
            onClick={() => setActiveTab("coaching")}
          >
            coaching counter <MdEventBusy size={18} />
          </button>
          <button
            className={`${activeTab === "tasks" ? "activeTab" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            tasks <SiGoogletasks size={18} />
          </button>
          <button
            className={`${activeTab === "agents" ? "activeTab" : ""}`}
            onClick={() => setActiveTab("agents")}
          >
            my agents <AiOutlineTeam size={18} />
          </button>
        </div>
        {activeTab === "tasks" && <Tasks />}
        {activeTab === "coaching" && <Working />}
        {activeTab === "agents" && <Working />}
      </div>
    </>
  );
}

export default TlTools;
