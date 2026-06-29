import { useState, useEffect } from "react";
import { ImCancelCircle } from "react-icons/im";
import BtnLoader from "../Reusables/UI/BtnLoader";
import Nothing from "./UI/Nothing";

function BookMarks() {
  const [ticketLink, setTicketLink] = useState("");
  const [ticketNote, setTicketNote] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tickets");
    if (stored) {
      setTimeout(() => {
        setTickets(JSON.parse(stored));
      }, 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);

  const onAddTicket = (e) => {
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

    setTickets((prev) => [...prev, newTicket]);
    setTicketLink("");
    setTicketNote("");
    setLoading(false);
  };

  const onDeleteTicket = (id) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
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
            <button>{loading ? <BtnLoader /> : "Add"}</button>
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
                    <ImCancelCircle size={22} />
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
