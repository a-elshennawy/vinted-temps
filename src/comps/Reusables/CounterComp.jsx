import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { VscDebugStart } from "react-icons/vsc";
import { IoExitOutline } from "react-icons/io5";
import { BiSolidMessageRoundedCheck } from "react-icons/bi";
import { FaGripLinesVertical, FaMinus, FaPlus } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import WaitingShift from "./UI/WaitingShift";
import hourIcon from "../../assets/imgs/one-hour.png";
import { BsFileEarmarkSpreadsheetFill } from "react-icons/bs";
import BtnLoader from "./UI/BtnLoader";
import { Link } from "react-router-dom";
import { IoMdLogIn } from "react-icons/io";
import { useCallback } from "react";

const SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwetjwCxjsIZSvty_XAyEb3DQ02g7l__p-Z5Q3mkSXrUDoMVbzylh-RKg1y3_EqtOC5uw/exec";

const STATUSES = ["live", "break", "lunch", "meeting", "training"];
const EMPTY_DURATIONS = {
  live: 0,
  break: 0,
  lunch: 0,
  meeting: 0,
  training: 0,
};

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
  // Date when the shift started (used as the sheet tab name — never changes mid-shift)
  const [shiftDate, setShiftDate] = useState(
    () => localStorage.getItem("shiftDate") || null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Refs for interval callbacks
  const currentCountRef = useRef(currentCount);
  const hourlyTargetRef = useRef(hourlyTarget);
  const statusRef = useRef(status);
  const statusDurationsBaseRef = useRef(statusDurationsBase);
  const statusStartTimeRef = useRef(statusStartTime);
  const lastCheckedHourRef = useRef(lastCheckedHour);
  const shiftDateRef = useRef(shiftDate);
  const logsRef = useRef(logs);

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
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);
  useEffect(() => {
    shiftDateRef.current = shiftDate;
  }, [shiftDate]);

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

  useEffect(() => {
    if (!isShiftActive) return;
    if (status !== "break" && status !== "lunch") return;

    const limit = status === "break" ? 15 * 60 * 1000 : 30 * 60 * 1000;

    const timer = setTimeout(() => {
      handleStatusChange("live");
    }, limit);

    return () => clearTimeout(timer);
  }, [status, isShiftActive]);

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
    if (shiftDate) localStorage.setItem("shiftDate", shiftDate);
    if (lastIncrease) localStorage.setItem("lastIncrease", lastIncrease);
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
    shiftDate,
    lastIncrease,
  ]);
  const agentSession = localStorage.getItem("agentSession");

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
      const nonLiveSeconds = Object.entries(durations)
        .filter(([type]) => type !== "live")
        .reduce((acc, [, sec]) => acc + sec, 0);
      const nonLiveMinutes = nonLiveSeconds / 60;
      const adjustedTarget = target - (target / 60) * nonLiveMinutes;
      const performance =
        adjustedTarget > 0 ? Math.round((count / adjustedTarget) * 100) : 100;
      const liveMinutes = Math.round(durations.live / 60);

      setLogs((prev) => [
        ...prev,
        {
          hourRange: `${formatHour(prevHour)} - ${formatHour(nextHour)}`,
          count,
          durations,
          performance,
          liveMinutes,
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

  const submitToSheet = async ({
    agentName,
    date,
    totalReplies,
    rph,
    performance,
  }) => {
    await fetch(SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ agentName, date, totalReplies, rph, performance }),
    });
  };

  const handleStartShift = () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    setShiftDate(dateStr);
    setIsShiftActive(true);
    setLastCheckedHour(today.getHours());
    setCurrentCount(0);
    setLogs([]);
    setEndTime(Date.now() + 9 * 60 * 60 * 1000);
    setStatus("live");
    setStatusDurationsBase({ ...EMPTY_DURATIONS });
    setStatusStartTime(Date.now());
  };

  const handleEndShift = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    const elapsed = Math.floor(
      (Date.now() - statusStartTimeRef.current) / 1000,
    );
    const finalDurations = {
      ...statusDurationsBaseRef.current,
      [statusRef.current]:
        (statusDurationsBaseRef.current[statusRef.current] || 0) + elapsed,
    };

    const finalCurrentCount = currentCountRef.current;
    const completedLogs = logsRef.current;

    const totalReplies =
      completedLogs.reduce((acc, log) => acc + log.count, 0) +
      finalCurrentCount;

    const completedLiveSeconds = completedLogs.reduce(
      (acc, log) => acc + (log.durations?.live || 0),
      0,
    );
    const currentLiveSeconds = finalDurations.live || 0;
    const totalLiveSeconds = completedLiveSeconds + currentLiveSeconds;
    const totalLiveHours = totalLiveSeconds / 3600;

    const rph =
      totalLiveHours > 0 ? Math.round(totalReplies / totalLiveHours) : 0;

    const completedPerformances = completedLogs.map((log) => log.performance);
    const target = hourlyTargetRef.current;
    const nonLiveSeconds = Object.entries(finalDurations)
      .filter(([type]) => type !== "live")
      .reduce((acc, [, sec]) => acc + sec, 0);
    const nonLiveMinutes = nonLiveSeconds / 60;
    const adjustedTarget = target - (target / 60) * nonLiveMinutes;
    const currentHourPerf =
      adjustedTarget > 0
        ? Math.round((finalCurrentCount / adjustedTarget) * 100)
        : 100;

    const allPerformances = [...completedPerformances, currentHourPerf];
    const avgPerformance =
      allPerformances.length > 0
        ? Math.round(
            allPerformances.reduce((a, b) => a + b, 0) / allPerformances.length,
          )
        : 0;

    const agentSession = localStorage.getItem("agentSession");
    if (agentSession) {
      const agentName = JSON.parse(agentSession).name;
      const dateToUse =
        shiftDateRef.current || new Date().toISOString().split("T")[0];

      try {
        await submitToSheet({
          agentName,
          date: dateToUse,
          totalReplies,
          rph,
          performance: avgPerformance,
        });
      } catch (err) {
        console.error("Sheet submission failed:", err);
        setSubmitError("Shift ended but couldn't sync to sheet. Ask your TL.");
      }
    }
    setIsShiftActive(false);
    setCurrentCount(0);
    setLogs([]);
    setEndTime(null);
    setStatus("live");
    setHourlyTarget(0);
    setStatusDurationsBase({ ...EMPTY_DURATIONS });
    setStatusStartTime(Date.now());
    setShiftDate(null);
    setSubmitting(false);

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
      "shiftDate",
      "lastIncrease",
    ].forEach((key) => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    if (!isShiftActive || !endTime) return;

    const interval = setInterval(() => {
      if (Date.now() >= endTime + 10 * 60 * 1000) {
        handleEndShift();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isShiftActive, endTime, handleEndShift]);

  const increment = () => {
    if (status !== "live") return;
    setCurrentCount((prev) => prev + 1);
    setLastIncrease(Date.now());
  };

  const decrement = () => {
    if (status !== "live") return;
    setCurrentCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const totalTickets =
    logs.reduce((acc, log) => acc + log.count, 0) + currentCount;

  const openPerformanceSheet = async () => {
    const date = new Date().toISOString().split("T")[0];
    const res = await fetch(`${SHEET_ENDPOINT}?date=${date}`);
    const url = await res.text();
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (!isShiftActive) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isShiftActive]);

  const timeSinceLastIncrease = lastIncrease ? now - lastIncrease : null;

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
        {agentSession ? (
          <>
            <button className="openSheetBtn" onClick={openPerformanceSheet}>
              performance <BsFileEarmarkSpreadsheetFill size={20} />
            </button>
          </>
        ) : (
          <>
            <Link className="toAgentLogin" to={`/auth/agent`}>
              agent login <IoMdLogIn size={20} />
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="counterComp" style={{ alignItems: "start !important" }}>
      <div className="head pb-2">
        <span className="targetNote">
          {hourlyTarget} replies <img src={hourIcon} alt="" />
        </span>
        {agentSession && (
          <>
            <button className="openSheetBtn" onClick={openPerformanceSheet}>
              performance <BsFileEarmarkSpreadsheetFill size={20} />
            </button>
          </>
        )}
      </div>

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
      <div className="pb-2 mb-1">
        {status === "break" && (
          <>
            <p>note: automatically returning live in 15 minutes</p>
          </>
        )}
        {status === "lunch" && (
          <>
            <p>note: automatically returning live in 30 minutes</p>
          </>
        )}
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

      {lastIncrease && (
        <span className="lastIncreaseNote mt-1">
          Last reply: {formatElapsed(timeSinceLastIncrease)} ago
        </span>
      )}

      <div className="currentStatus my-2">
        <span>{status}</span>
        <span style={{ filter: `drop-shadow(0 0 0.313rem var(--${status}))` }}>
          <GoDotFill size={24} color={`var(--${status})`} />
        </span>
        <FaGripLinesVertical size={22} color="var(--white)" />
        <span>{totalTickets}</span>
        <BiSolidMessageRoundedCheck size={24} color="var(--white)" />
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
      {logs.length === 9 && (
        <div className="endShiftNotice">
          <p>note : shift will automatically end in 10 minutes</p>
        </div>
      )}

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
