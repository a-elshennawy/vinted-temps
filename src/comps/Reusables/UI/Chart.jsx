import { useMemo } from "react";
import { Chart } from "react-charts";

export default function MyChart({ data, labels }) {
  const chartData = useMemo(
    () => [
      {
        label: "Replies",
        data: labels.map((label, i) => ({
          primary: label,
          secondary: data[i],
        })),
      },
    ],
    [data, labels],
  );

  const primaryAxis = useMemo(
    () => ({
      getValue: (datum) => datum.primary,
      scaleType: "band",
    }),
    [],
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum) => datum.secondary,
        elementType: "line",
        formatters: {
          scale: (val) => Math.round(val),
          tooltip: (val) => Math.round(val),
        },
        tickCount: Math.max(...data),
      },
    ],
    [data],
  );

  return (
    <div className="chart" style={{ height: "320px" }}>
      <Chart
        options={{
          data: chartData,
          primaryAxis,
          secondaryAxes,
          dark: true,
          tooltip: true,
        }}
      />
    </div>
  );
}
