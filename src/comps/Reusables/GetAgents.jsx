import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { useState, useEffect } from "react";
import Loader from "./UI/Loader";

function GetAgents() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth/admin");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setAgents(data);
      setLoading(false);
    };
    fetchAgents();

    const channel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (!payload.new.approval) {
              setAgents((prev) => [payload.new, ...prev]);
            }
          } else if (payload.eventType === "DELETE") {
            setAgents((prev) => prev.filter((t) => t.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setAgents((prev) => prev.filter((t) => t.id !== payload.new.id));
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  if (loading || !user) {
    return <Loader />;
  }

  return (
    <>
      <table className="agentsTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>TWWID</th>
            <th>Vinted ID</th>
            <th>TL</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id}>
              <td>{agent.name}</td>
              <td>{agent.email}</td>
              <td>{agent.tww_id}</td>
              <td>{agent.vinted_id}</td>
              <td>{agent.team_leader}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default GetAgents;
