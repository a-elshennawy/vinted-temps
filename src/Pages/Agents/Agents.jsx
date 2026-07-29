import { useState } from "react";
import "./Agents.css";
import AddNewAgent from "../../comps/Reusables/AddNewAgent";
import GetAgents from "../../comps/Reusables/GetAgents";
function Agents() {
  const [activeTab, setActiveTab] = useState("addNew");

  return (
    <>
      <title>Vinted Internal | Agents</title>
      <div className="agentsPage py-3">
        <div className="tabSwitcher">
          <button
            className={activeTab === "addNew" ? "activeTab" : ""}
            onClick={() => setActiveTab("addNew")}
          >
            add new
          </button>
          <button
            className={activeTab === "agentsDB" ? "activeTab" : ""}
            onClick={() => setActiveTab("agentsDB")}
          >
            agents DB
          </button>
        </div>

        {activeTab === "addNew" && <AddNewAgent />}
        {activeTab === "agentsDB" && <GetAgents />}
      </div>
    </>
  );
}

export default Agents;
