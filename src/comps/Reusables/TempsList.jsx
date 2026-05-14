import { FaHeart, FaCopy } from "react-icons/fa";

function TempsList() {
  const temps = JSON.parse(localStorage.getItem("temps")) || [];

  return (
    <>
      <div className="tempsList col-5">
        <h3>saved templates</h3>
        <input type="search" placeholder="search using template title..." />
        {temps.map((temp, index) => (
          <div key={index} className="temp">
            <div className="header">
              <h5>{temp.title}</h5>
              <span>
                <FaCopy color="var(--white)" />
              </span>
            </div>

            <div className="body">
              <p>{temp.body}</p>
            </div>

            <div className="actions">
              <span>
                <FaHeart />
              </span>
              <span>{temp.likes}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default TempsList;
