import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { VscDebugStart } from "react-icons/vsc";
import { IoExitOutline } from "react-icons/io5";
import { BiSolidMessageRoundedCheck } from "react-icons/bi";
import { FaGripLinesVertical, FaMinus, FaPlus } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import WaitingShift from "./UI/WaitingShift";
import hourIcon from "../../assets/imgs/one-hour.png";

const STATUSES = ["live", "break", "lunch", "meeting", "training"];
const EMPTY_DURATIONS = {
  live: 0,
  break: 0,
  lunch: 0,
  meeting: 0,
  training: 0,
};

function CounterComp() {
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
  const [status, setStatus] = useState(
    () => localStorage.getItem("shiftStatus") || "live",
  );
  const [endTime, setEndTime] = useState(() => {
    const saved = localStorage.getItem("endTime");
    return saved ? parseInt(saved) : null;
  });
  const [hourlyTarget, setHourlyTarget] = useState(
    () => parseInt(localStorage.getItem("hourlyTarget")) || 0,
  );
  const [statusDurationsBase, setStatusDurationsBase] = useState(() => {
    const saved = localStorage.getItem("statusDurationsBase");
    return saved ? JSON.parse(saved) : { ...EMPTY_DURATIONS };
  });
  const [statusStartTime, setStatusStartTime] = useState(() => {
    const saved = localStorage.getItem("statusStartTime");
    return saved ? parseInt(saved) : Date.now();
  });

  // Refs for interval callbacks
  const currentCountRef = useRef(currentCount);
  const hourlyTargetRef = useRef(hourlyTarget);
  const statusRef = useRef(status);
  const statusDurationsBaseRef = useRef(statusDurationsBase);
  const statusStartTimeRef = useRef(statusStartTime);
  const lastCheckedHourRef = useRef(lastCheckedHour);

  useEffect(() => {
    currentCountRef.current = currentCount;
  }, [currentCount]);
  useEffect(() => {
    hourlyTargetRef.current = hourlyTarget;
  }, [hourlyTarget]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    statusDurationsBaseRef.current = statusDurationsBase;
  }, [statusDurationsBase]);
  useEffect(() => {
    statusStartTimeRef.current = statusStartTime;
  }, [statusStartTime]);
  useEffect(() => {
    lastCheckedHourRef.current = lastCheckedHour;
  }, [lastCheckedHour]);

  const handleStatusChange = (newStatus) => {
    if (newStatus === statusRef.current) return;
    setStatusDurationsBase((prev) => {
      const elapsed = Math.floor(
        (Date.now() - statusStartTimeRef.current) / 1000,
      );
      return {
        ...prev,
        [statusRef.current]: (prev[statusRef.current] || 0) + elapsed,
      };
    });
    setStatusStartTime(() => Date.now());
    setStatus(newStatus);
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("isShiftActive", isShiftActive);
    localStorage.setItem("currentCount", currentCount);
    localStorage.setItem("logs", JSON.stringify(logs));
    localStorage.setItem("lastCheckedHour", lastCheckedHour);
    localStorage.setItem("shiftStatus", status);
    if (endTime) localStorage.setItem("endTime", endTime);
    localStorage.setItem("hourlyTarget", hourlyTarget);
    localStorage.setItem(
      "statusDurationsBase",
      JSON.stringify(statusDurationsBase),
    );
    localStorage.setItem("statusStartTime", statusStartTime);
  }, [
    isShiftActive,
    currentCount,
    logs,
    lastCheckedHour,
    status,
    endTime,
    hourlyTarget,
    statusDurationsBase,
    statusStartTime,
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

      // Flush current elapsed into durations before logging
      const elapsed = Math.floor(
        (Date.now() - statusStartTimeRef.current) / 1000,
      );
      const durations = {
        ...statusDurationsBaseRef.current,
        [statusRef.current]:
          (statusDurationsBaseRef.current[statusRef.current] || 0) + elapsed,
      };

      const count = currentCountRef.current;
      const target = hourlyTargetRef.current;
      const liveSeconds = durations.live;
      const liveMinutes = liveSeconds / 60;
      const nonLiveSeconds = Object.entries(durations)
        .filter(([type]) => type !== "live")
        .reduce((acc, [, sec]) => acc + sec, 0);
      const nonLiveMinutes = nonLiveSeconds / 60;
      const adjustedTarget = target - (target / 60) * nonLiveMinutes;
      const performance =
        adjustedTarget > 0 ? Math.round((count / adjustedTarget) * 100) : 100;

      setLogs((prev) => [
        ...prev,
        {
          hourRange: `${formatHour(prevHour)} - ${formatHour(nextHour)}`,
          count,
          durations,
          performance,
          liveMinutes: Math.round(liveMinutes),
        },
      ]);

      setCurrentCount(0);
      setLastCheckedHour(currentHour);
      setStatusDurationsBase({ ...EMPTY_DURATIONS });
      setStatusStartTime(Date.now());
    };

    checkHour();
    const interval = setInterval(checkHour, 1000);
    return () => clearInterval(interval);
  }, [isShiftActive, lastCheckedHour]);

  const handleStartShift = () => {
    setIsShiftActive(true);
    setLastCheckedHour(new Date().getHours());
    setCurrentCount(0);
    setLogs([]);
    setEndTime(Date.now() + 9 * 60 * 60 * 1000);
    setStatus("live");
    setStatusDurationsBase({ ...EMPTY_DURATIONS });
    setStatusStartTime(Date.now());
  };

  const handleEndShift = () => {
    setIsShiftActive(false);
    setCurrentCount(0);
    setLogs([]);
    setEndTime(null);
    setStatus("live");
    setHourlyTarget(0);
    setStatusDurationsBase({ ...EMPTY_DURATIONS });
    setStatusStartTime(Date.now());
    [
      "isShiftActive",
      "currentCount",
      "logs",
      "lastCheckedHour",
      "shiftStatus",
      "endTime",
      "hourlyTarget",
      "statusDurationsBase",
      "statusStartTime",
    ].forEach((key) => localStorage.removeItem(key));
  };

  const increment = () => {
    if (status !== "live") return;
    setCurrentCount((prev) => prev + 1);
  };

  const decrement = () => {
    if (status !== "live") return;
    setCurrentCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const totalTickets =
    logs.reduce((acc, log) => acc + log.count, 0) + currentCount;

  if (!isShiftActive) {
    return (
      <div className="preShiftComp p-0">
        <WaitingShift />
        <div className="targetInput mb-1">
          <label>Hourly Target</label>
          <input
            type="number"
            value={hourlyTarget}
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
      <span className="targetNote mb-1">
        {hourlyTarget} replies <img src={hourIcon} alt="" />
      </span>

      <div className="statusSelector mb-3 mt-1 text-center">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`statusBtn ${status === s ? "activeStatus" : ""}`}
            onClick={() => handleStatusChange(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mainCounter py-2 px-0">
        <button onClick={decrement} disabled={status !== "live"}>
          <FaMinus size={24} />
        </button>
        <h1>{currentCount}</h1>
        <button onClick={increment} disabled={status !== "live"}>
          <FaPlus size={24} />
        </button>
      </div>

      <div className="currentStatus my-2">
        <span>{status}</span>
        <span style={{ filter: `drop-shadow(0 0 0.313rem var(--${status}))` }}>
          <GoDotFill size={24} color={`var(--${status})`} />
        </span>
        <FaGripLinesVertical size={22} color="var(--white)" />
        <span>{totalTickets}</span>
        <BiSolidMessageRoundedCheck size={24} color="var(--white)" />
        <FaGripLinesVertical size={22} color="var(--white)" />
        <button className="endBtn" onClick={handleEndShift}>
          End Shift <IoExitOutline size={20} />
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
              <span className="logCount">
                {log.count} <BiSolidMessageRoundedCheck />
              </span>
              <div className="line my-1"></div>
              <div className="logDurations">
                {Object.entries(log.durations).map(
                  ([type, sec]) =>
                    sec > 0 && (
                      <div key={type} className="durationItem">
                        {type} : {Math.floor(sec / 60)}m {sec % 60}s
                      </div>
                    ),
                )}
              </div>
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
