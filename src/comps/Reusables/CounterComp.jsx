import { useState, useEffect } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { VscDebugStart } from "react-icons/vsc";
import { IoExitOutline, IoTicketOutline } from "react-icons/io5";
import { FaMinus, FaPlus } from "react-icons/fa";
import correctIcon from "../../assets/imgs/correct.png";
import incSound from "../../assets/wow.mp3";
import decSound from "../../assets/faaah.mp3";
import endShiftSound from "../../assets/bruh.mp3";
import WaitingShift from "./UI/WaitingShift";

function CounterComp() {
  const [isShiftActive, setIsShiftActive] = useState(() => {
    return localStorage.getItem("isShiftActive") === "true";
  });
  const [currentCount, setCurrentCount] = useState(() => {
    return parseInt(localStorage.getItem("currentCount")) || 0;
  });
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem("logs");
    return savedLogs ? JSON.parse(savedLogs) : [];
  });
  const [lastCheckedHour, setLastCheckedHour] = useState(() => {
    const savedHour = localStorage.getItem("lastCheckedHour");
    return savedHour !== null ? parseInt(savedHour) : new Date().getHours();
  });

  useEffect(() => {
    localStorage.setItem("isShiftActive", isShiftActive);
    localStorage.setItem("currentCount", currentCount);
    localStorage.setItem("logs", JSON.stringify(logs));
    localStorage.setItem("lastCheckedHour", lastCheckedHour);
  }, [isShiftActive, currentCount, logs, lastCheckedHour]);

  useEffect(() => {
    if (!isShiftActive) return;

    const checkHour = () => {
      const now = new Date();
      const currentHour = now.getHours();

      if (currentHour !== lastCheckedHour) {
        const prevHour = lastCheckedHour;
        const nextHour = (prevHour + 1) % 24;

        const formatHour = (h) => {
          const period = h >= 12 ? "PM" : "AM";
          const hour = h % 12 || 12;
          return `${hour} ${period}`;
        };

        const hourRange = `${formatHour(prevHour)} - ${formatHour(nextHour)}`;

        setLogs((prev) => [...prev, { hourRange, count: currentCount }]);
        setCurrentCount(0);
        setLastCheckedHour(currentHour);
      }
    };

    checkHour();
    const interval = setInterval(checkHour, 1000);
    return () => clearInterval(interval);
  }, [isShiftActive, lastCheckedHour, currentCount]);

  const handleStartShift = () => {
    const startHour = new Date().getHours();
    setIsShiftActive(true);
    setLastCheckedHour(startHour);
    setCurrentCount(0);
    setLogs([]);
  };

  const handleEndShift = () => {
    playSound(endShiftSound);
    setIsShiftActive(false);
    setCurrentCount(0);
    setLogs([]);
    localStorage.removeItem("isShiftActive");
    localStorage.removeItem("currentCount");
    localStorage.removeItem("logs");
    localStorage.removeItem("lastCheckedHour");
  };

  const playSound = (src) => {
    new Audio(src).play();
  };

  const increment = () => {
    setCurrentCount((prev) => prev + 1);
    playSound(incSound);
  };

  const decrement = () => {
    setCurrentCount((prev) => (prev > 0 ? prev - 1 : 0));
    playSound(decSound);
  };

  const totalTickets =
    logs.reduce((acc, log) => acc + log.count, 0) + currentCount;

  if (!isShiftActive) {
    return (
      <div className="counterComp text-center">
        <WaitingShift />
        <button className="startBtn" onClick={handleStartShift}>
          start shift <VscDebugStart size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="counterComp">
      <div className="mainCounter py-2 px-0 mb-3">
        <button onClick={decrement}>
          <FaMinus size={24} />
        </button>
        <h1>{currentCount}</h1>
        <button onClick={increment}>
          <FaPlus size={24} />
        </button>
      </div>

      <AnimatePresence>
        {totalTickets > 0 && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="currentTotal my-2"
          >
            <span>current total : {totalTickets}</span>
            <img src={correctIcon} alt="icon" />
          </Motion.div>
        )}
      </AnimatePresence>

      <button className="endBtn my-2" onClick={handleEndShift}>
        End Shift <IoExitOutline size={20} />
      </button>

      <div className="logs">
        <AnimatePresence>
          {logs.map((log, index) => (
            <Motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="logItem"
            >
              <span className="logRange">{log.hourRange}</span>
              <span className="logCount mb-1">
                {log.count} tickets <IoTicketOutline />
              </span>
            </Motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CounterComp;
