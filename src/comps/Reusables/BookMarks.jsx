import { useState, useEffect } from "react";
import BtnLoader from "../Reusables/UI/BtnLoader";
import Nothing from "./UI/Nothing";
import { supabase } from "../../supabase";
import { TiDelete } from "react-icons/ti";

function BookMarks() {
  const [ticketLink, setTicketLink] = useState("");
  const [ticketNote, setTicketNote] = useState("");
  const [loading, setLoading] = useState(false);
  const agentSession = localStorage.getItem("agentSession");
  const agentName = agentSession ? JSON.parse(agentSession)?.name : null;

  const [tickets, setTickets] = useState(() => {
    if (agentSession) return [];
    const stored = localStorage.getItem("tickets");
    return stored ? JSON.parse(stored) : [];
  });

  const getBookmarks = async () => {
    if (!agentSession) return;
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("owner", agentName);
    if (error) {
      console.error("fetch bookmarks error:", error);
      return;
    }
    setTickets(data || []);
  };

  useEffect(() => {
    if (agentSession) {
      setTimeout(() => {
        getBookmarks();
      }, 0);
    }
  });

  useEffect(() => {
    if (!agentSession || !agentName) return;

    const channel = supabase
      .channel(`bookmarks-${agentName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `owner=eq.${agentName}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTickets((prev) =>
              prev.some((t) => t.id === payload.new.id)
                ? prev
                : [...prev, payload.new],
            );
          } else if (payload.eventType === "UPDATE") {
            setTickets((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t)),
            );
          } else if (payload.eventType === "DELETE") {
            setTickets((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentSession, agentName]);

  useEffect(() => {
    if (!agentSession) {
      localStorage.setItem("tickets", JSON.stringify(tickets));
    }
  }, [tickets, agentSession]);

  const onAddTicket = async (e) => {
    e.preventDefault();
    if (!ticketLink || !ticketNote) return;
    setLoading(true);
    let cleanLink = ticketLink.trim();
    if (!/^https?:\/\//i.test(cleanLink)) {
      cleanLink = `https://${cleanLink}`;
    }
    const newTicket = {
      id: Date.now(),
      link: cleanLink,
      note: ticketNote.trim(),
    };

    if (agentSession) {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([{ ...newTicket, owner: agentName }])
        .select();

      if (error) {
        console.error("insert error:", error);
      } else if (data?.length) {
        setTickets((prev) => [...prev, data[0]]);
      }
    } else {
      setTickets((prev) => [...prev, newTicket]);
    }

    setTicketLink("");
    setTicketNote("");
    setLoading(false);
  };

  const onDeleteTicket = async (id) => {
    if (agentSession) {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);

      if (error) {
        console.error("delete error:", error);
        return;
      }
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } else {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <>
      <div className="bookmarksComp py-2">
        <form onSubmit={onAddTicket}>
          <div className="inputField">
            <input
              type="text"
              required
              value={ticketLink}
              onChange={(e) => setTicketLink(e.target.value)}
              placeholder="Ticket link..."
            />
          </div>
          <div className="inputField">
            <input
              type="text"
              required
              value={ticketNote}
              onChange={(e) => setTicketNote(e.target.value)}
              placeholder="Ticket note..."
            />
          </div>
          <div className="action">
            <button>
              {loading ? (
                <>
                  Adding <BtnLoader color="var(--first)" />
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </form>
        {tickets.length === 0 && <Nothing />}
        {tickets.length > 0 && (
          <div className="bookmarksList">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bookmarkItem">
                <div className="header">
                  <span>{ticket.note}</span>
                  <button onClick={() => onDeleteTicket(ticket.id)}>
                    <TiDelete size={22} />
                  </button>
                </div>
                <a href={ticket.link} target="_blank" rel="noopener noreferrer">
                  {ticket.link}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default BookMarks;
