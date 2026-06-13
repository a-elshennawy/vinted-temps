import { useState, useEffect } from "react";
import Chart from "./UI/Chart";
import ThinkingComp from "./UI/Thinking";

function Performance() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem("logs");
    if (savedLogs) {
      setTimeout(() => {
        setLogs(JSON.parse(savedLogs));
      }, 0);
    }
  }, []);

  if (logs.length === 0) {
    return <ThinkingComp />;
  }

  const chartData = logs.map((log) => log.count);
  const chartLabels = logs.map((log) => log.hourRange);

  return (
    <>
      <Chart data={chartData} labels={chartLabels} />
    </>
  );
}

export default Performance;
