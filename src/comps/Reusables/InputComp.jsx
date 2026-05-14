import { CiBookmarkCheck } from "react-icons/ci";
import { useState } from "react";

function InputComp() {
  const [tempTitle, setTempTitle] = useState("");
  const [tempBody, setTempBody] = useState("");
  const [tempLikes, setTempLikes] = useState(0);

  const handleSave = () => {
    const temp = { title: tempTitle, body: tempBody, likes: tempLikes };

    let existing = [];

    try {
      const parsed = JSON.parse(localStorage.getItem("temps"));
      existing = Array.isArray(parsed) ? parsed : [];
    } catch {
      existing = [];
    }

    existing.push(temp);
    localStorage.setItem("temps", JSON.stringify(existing));
    setTempTitle("");
    setTempBody("");
  };

  return (
    <div className="inpComp col-5">
      <h3>add template</h3>

      <div className="inputField">
        <label>template Title</label>
        <input
          type="text"
          placeholder="template title"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
        />
      </div>

      <div className="inputField">
        <label>template Body</label>
        <textarea
          cols={40}
          rows={5}
          placeholder="template body"
          value={tempBody}
          onChange={(e) => setTempBody(e.target.value)}
        />
      </div>

      <div className="btnsField">
        <button onClick={handleSave}>
          Add <CiBookmarkCheck size={20} />
        </button>
      </div>
    </div>
  );
}

export default InputComp;
