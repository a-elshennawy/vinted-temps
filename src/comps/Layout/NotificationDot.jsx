import { supabase } from "../../supabase";
import { useEffect, useState } from "react";

function NotificationDot() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from("templates")
        .select("*", { count: "exact", had: true })
        .eq("approval", false);
      if (!error) setCount(count);
    };

    fetchCount();

    const channel = supabase
      .channel("pending-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "templates" },
        () => fetchCount(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (count === 0) return null;

  return <span className="NotificationDot">{count}</span>;
}

export default NotificationDot;
