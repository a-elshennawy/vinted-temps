import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { VscDebugStart } from "react-icons/vsc";
import { IoExitOutline } from "react-icons/io5";
import { BiSolidMessageRoundedCheck } from "react-icons/bi";
import { FaGripLinesVertical, FaMinus, FaPlus } from "react-icons/fa";
import WaitingShift from "./UI/WaitingShift";
import hourIcon from "../../assets/imgs/one-hour.png";
import BtnLoader from "./UI/BtnLoader";
import { addRepliesToAgent } from "../../Functions/Helpers";

function CounterComp() {
  const [lastIncrease, setLastIncrease] = useState(
    () => parseInt(localStorage.getItem("lastIncrease")) || null,
  );
  const [now, setNow] = useState(() => Date.now());
  const [isShiftActive, setIsShiftActive] = useState(
    () => localStorage.getItem("isShiftActive") === "true",
  );
  const [currentCount, setCurrentCount] = useState(
    () => parseInt(localStorage.getItem("currentCount")) || 0,
  );
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("logs");
    return saved ? JSON.parse(saved) : [];
  });
  const [lastCheckedHour, setLastCheckedHour] = useState(() => {
    const saved = localStorage.getItem("lastCheckedHour");
    return saved !== null ? parseInt(saved) : new Date().getHours();
  });
  const [hourlyTarget, setHourlyTarget] = useState(
    () => parseInt(localStorage.getItem("hourlyTarget")) || 0,
  );
  // When the current shift started (used for total-duration / rph calc on end)
  const [shiftStartTime, setShiftStartTime] = useState(() => {
    const saved = localStorage.getItem("shiftStartTime");
    return saved ? parseInt(saved) : Date.now();
  });
  // Date when the shift started (used as an identifier — never changes mid-shift)
  const [shiftDate, setShiftDate] = useState(
    () => localStorage.getItem("shiftDate") || null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Refs for interval callbacks
  const currentCountRef = useRef(currentCount);
  const hourlyTargetRef = useRef(hourlyTarget);
  const lastCheckedHourRef = useRef(lastCheckedHour);
  const shiftDateRef = useRef(shiftDate);
  const shiftStartTimeRef = useRef(shiftStartTime);
  const logsRef = useRef(logs);

  useEffect(() => {
    currentCountRef.current = currentCount;
  }, [currentCount]);
  useEffect(() => {
    hourlyTargetRef.current = hourlyTarget;
  }, [hourlyTarget]);
  useEffect(() => {
    lastCheckedHourRef.current = lastCheckedHour;
  }, [lastCheckedHour]);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);
  useEffect(() => {
    shiftDateRef.current = shiftDate;
  }, [shiftDate]);
  useEffect(() => {
    shiftStartTimeRef.current = shiftStartTime;
  }, [shiftStartTime]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("isShiftActive", isShiftActive);
    localStorage.setItem("currentCount", currentCount);
    localStorage.setItem("logs", JSON.stringify(logs));
    localStorage.setItem("lastCheckedHour", lastCheckedHour);
    localStorage.setItem("hourlyTarget", hourlyTarget);
    localStorage.setItem("shiftStartTime", shiftStartTime);
    if (shiftDate) localStorage.setItem("shiftDate", shiftDate);
    if (lastIncrease) localStorage.setItem("lastIncrease", lastIncrease);
  }, [
    isShiftActive,
    currentCount,
    logs,
    lastCheckedHour,
    hourlyTarget,
    shiftStartTime,
    shiftDate,
    lastIncrease,
  ]);

  // Hour boundary check
  useEffect(() => {
    if (!isShiftActive) return;

    const checkHour = () => {
      const currentHour = new Date().getHours();
      if (currentHour === lastCheckedHourRef.current) return;

      const prevHour = lastCheckedHourRef.current;
      const nextHour = (prevHour + 1) % 24;

      const formatHour = (h) => {
        const period = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return `${hour} ${period}`;
      };

      const count = currentCountRef.current;
      const target = hourlyTargetRef.current;
      const performance = target > 0 ? Math.round((count / target) * 100) : 100;

      setLogs((prev) => [
        ...prev,
        {
          hourRange: `${formatHour(prevHour)} - ${formatHour(nextHour)}`,
          count,
          performance,
        },
      ]);

      setCurrentCount(0);
      setLastCheckedHour(currentHour);
    };

    checkHour();
    const interval = setInterval(checkHour, 1000);
    return () => clearInterval(interval);
  }, [isShiftActive, lastCheckedHour]);

  const handleStartShift = () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    setShiftDate(dateStr);
    setIsShiftActive(true);
    setLastCheckedHour(today.getHours());
    setCurrentCount(0);
    setLogs([]);
    setShiftStartTime(Date.now());
  };

  const handleEndShift = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    const finalCurrentCount = currentCountRef.current;
    const completedLogs = logsRef.current;

    const totalReplies =
      completedLogs.reduce((acc, log) => acc + log.count, 0) +
      finalCurrentCount;

    const totalElapsedHours =
      (Date.now() - shiftStartTimeRef.current) / (1000 * 60 * 60);

    const rph =
      totalElapsedHours > 0 ? Math.round(totalReplies / totalElapsedHours) : 0;

    const completedPerformances = completedLogs.map((log) => log.performance);
    const target = hourlyTargetRef.current;
    const currentHourPerf =
      target > 0 ? Math.round((finalCurrentCount / target) * 100) : 100;

    const allPerformances = [...completedPerformances, currentHourPerf];
    const avgPerformance =
      allPerformances.length > 0
        ? Math.round(
            allPerformances.reduce((a, b) => a + b, 0) / allPerformances.length,
          )
        : 0;

    const dateToUse =
      shiftDateRef.current || new Date().toISOString().split("T")[0];

    void dateToUse;
    void rph;
    void avgPerformance;

    const agentSession = localStorage.getItem("agentSession");
    if (agentSession) {
      try {
        const agent = JSON.parse(agentSession);
        await addRepliesToAgent(agent.vinted_id, totalReplies);
      } catch (err) {
        console.error("Supabase sync failed:", err);
        setSubmitError("Shift ended but couldn't sync replies. Ask your TL.");
      }
    }

    setIsShiftActive(false);
    setCurrentCount(0);
    setLogs([]);
    setHourlyTarget(0);
    setShiftDate(null);
    setSubmitting(false);

    [
      "isShiftActive",
      "currentCount",
      "logs",
      "lastCheckedHour",
      "hourlyTarget",
      "shiftStartTime",
      "shiftDate",
      "lastIncrease",
    ].forEach((key) => localStorage.removeItem(key));
  }, []);

  // increment / decrement functions
  const increment = () => {
    setCurrentCount((prev) => prev + 1);
    setLastIncrease(Date.now());
  };

  const decrement = () => {
    setCurrentCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // total replies until now
  const totalTickets =
    logs.reduce((acc, log) => acc + log.count, 0) + currentCount;

  useEffect(() => {
    if (!isShiftActive) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isShiftActive]);

  // time since last relpy
  const timeSinceLastIncrease = lastIncrease ? now - lastIncrease : null;

  // formatting time elapsed since the last reply
  function formatElapsed(ms) {
    if (ms == null) return "";
    const totalSeconds = Math.floor(ms / 1000);

    if (totalSeconds < 60) return "less than a minute";

    const totalMinutes = Math.floor(totalSeconds / 60);
    if (totalMinutes < 60) {
      return `${totalMinutes} minute${totalMinutes !== 1 ? "s" : ""}`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} Hour${hours !== 1 ? "s" : ""} : ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  // no active shift
  if (!isShiftActive) {
    return (
      <div className="preShiftComp p-0">
        <WaitingShift />
        {submitError && (
          <p
            style={{
              color: "var(--red)",
              fontSize: "0.8rem",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            {submitError}
          </p>
        )}
        <div className="targetInput mb-1">
          <label>Hourly Target</label>
          <input
            type="number"
            value={hourlyTarget}
            min="0"
            onChange={(e) => setHourlyTarget(parseInt(e.target.value) || 0)}
          />
        </div>
        <button className="startBtn" onClick={handleStartShift}>
          start shift <VscDebugStart size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="counterComp" style={{ alignItems: "start !important" }}>
      <div className="head py-2">
        <span className="targetNote">
          {hourlyTarget} replies <img src={hourIcon} alt="timer icon" />
        </span>
      </div>

      <div className="mainCounter py-2 px-0">
        <button onClick={decrement}>
          <FaMinus size={24} />
        </button>
        <h1>{currentCount}</h1>
        <button onClick={increment}>
          <FaPlus size={24} />
        </button>
      </div>

      {lastIncrease && (
        <span className="lastIncreaseNote">
          Last Reply : {formatElapsed(timeSinceLastIncrease)} ago
        </span>
      )}

      <div className="currentStatus">
        <div className="totalCounts">
          <span>{totalTickets}</span>
          <BiSolidMessageRoundedCheck size={24} color="var(--white)" />
        </div>
        <FaGripLinesVertical size={22} color="var(--white)" />
        <button
          className="endBtn"
          onClick={handleEndShift}
          disabled={submitting}
          style={{ opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? (
            <>
              Syncing
              <BtnLoader />
            </>
          ) : (
            <>
              End Shift <IoExitOutline size={20} />
            </>
          )}
        </button>
      </div>

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
              <div className="logHeader">
                <span className="logRange">{log.hourRange}</span>
              </div>
              <span className="logCount my-2">
                {log.count} <BiSolidMessageRoundedCheck />
              </span>

              <div className="line my-1"></div>
              <span className="logPerformance">
                {log.performance}%
                <div className="progressBar my-1">
                  <div
                    className={`progress ${
                      log.performance < 50
                        ? "red"
                        : log.performance < 75
                          ? "warning"
                          : "success"
                    }`}
                    style={{ maxWidth: `${log.performance}%` }}
                  />
                </div>
              </span>
            </Motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CounterComp;
