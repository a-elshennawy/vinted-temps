import "./Rank.css";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import Loader from "../../comps/Reusables/UI/Loader";
import personIcon from "../../assets/imgs/person.png";
import goblinIcon from "../../assets/imgs/goblin.png";
import dongleIcon from "../../assets/imgs/dongle.png";
import kakoIcon from "../../assets/imgs/kako.png";
import Working from "../../comps/Reusables/UI/Working";
import loadingCat from "../../assets/imgs/loadingCat.png";
import arrowIcon from "../../assets/imgs/arrow.png";
import { IoIosWarning } from "react-icons/io";

const TITLES = ["human", "goblin", "dongle", "kako"];
const agentSession = localStorage.getItem("agentSession");
const agentName = agentSession ? JSON.parse(agentSession).name : null;

function getTitleForRank(rank) {
  return TITLES[Math.min(rank - 1, TITLES.length - 1)];
}

function getIconForTitle(title) {
  switch (title) {
    case "human":
      return personIcon;
    case "goblin":
      return goblinIcon;
    case "dongle":
      return dongleIcon;
    case "kako":
      return kakoIcon;
    default:
      return null;
  }
}

function rankAgents(agents) {
  const sorted = [...agents].sort(
    (a, b) => (b.replies || 0) - (a.replies || 0),
  );

  let rank = 0;
  let lastReplies = null;

  const ranked = sorted.map((agent) => {
    if (agent.replies !== lastReplies) {
      rank += 1;
      lastReplies = agent.replies;
    }
    return { ...agent, rank, title: getTitleForRank(rank) };
  });

  const rankCounts = ranked.reduce((acc, a) => {
    acc[a.rank] = (acc[a.rank] || 0) + 1;
    return acc;
  }, {});

  return ranked.map((a) => ({ ...a, tied: rankCounts[a.rank] > 1 }));
}

function Rank() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
    }, 0);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase.from("agents").select("*");
      if (!error) setAgents(data);
      setLoading(false);
    };
    fetchAgents();

    const channel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (!payload.new.approval) {
              setAgents((prev) => [payload.new, ...prev]);
            }
          } else if (payload.eventType === "DELETE") {
            setAgents((prev) => prev.filter((a) => a.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setAgents((prev) =>
              prev.map((a) => (a.id === payload.new.id ? payload.new : a)),
            );
          }
        },
      )
      .subscribe((status, err) => {
        console.log("agents-changes channel status:", status, err || "");
      });

    return () => supabase.removeChannel(channel);
  }, []);

  const rankedAgents = useMemo(() => rankAgents(agents), [agents]);

  const needToGo = !agentSession && !isLoggedIn;

  useEffect(() => {
    if (loading) {
      return;
    }

    if (needToGo) {
      navigate("/");
    }
  }, [needToGo, navigate, loading]);

  if (loading) {
    return <Loader />;
  }

  const handleResetReplies = async () => {
    const { error } = await supabase
      .from("agents")
      .update({ replies: 0 })
      .not("id", "is", null);

    if (error) {
      console.error("Failed to reset replies:", error);
    }
  };

  if (agents.length === 0) {
    return (
      <>
        <div className="row justify-content-center align-items-center text-center py-5">
          <div className="col-9">
            <Working />
          </div>
        </div>
      </>
    );
  }

  const allZero =
    agents.length > 0 && agents.every((a) => (a.replies || 0) === 0);

  if (allZero) {
    return (
      <>
        <div className="row justify-content-center align-items-center text-center py-5 m-0">
          <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 col-10 m-0">
            <img src={loadingCat} alt="" width="100%" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <title>Vinted Internal | Rank</title>
      <div className="rankPage py-5">
        {isLoggedIn && (
          <>
            <div className="resetSection p-1 mb-2">
              <p>use only by the end of the month</p>
              <button onClick={handleResetReplies}>
                Reset replies <IoIosWarning size={20} />
              </button>
            </div>
          </>
        )}
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Agent</th>
              <th>Replies</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {rankedAgents.map((agent) => {
              const isMe = agent.name === agentName;
              return (
                <>
                  <tr
                    key={agent.id}
                    className={`rank-${agent.title}${agent.tied ? " tied" : ""}${isMe ? " me" : ""}`}
                  >
                    <td>
                      {isMe && <img src={arrowIcon} alt="here" />}
                      {agent.rank}
                    </td>
                    <td>{agent.name}</td>
                    <td>{agent.replies}</td>
                    <td className="title">
                      {agent.title}
                      <img
                        src={getIconForTitle(agent.title)}
                        alt={agent.title}
                      />
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Rank;
