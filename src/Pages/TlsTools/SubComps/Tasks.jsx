import { useState, useEffect } from "react";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  // const [tasksTitle, setTasksTitle] = useState("");
  // const [taskNote, setTaskNote] = useState("");
  // const [taskLink, setTaskLink] = useState("");

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTimeout(() => {
        setTasks(JSON.parse(storedTasks));
      }, 0);
    } else {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  return <></>;
}

export default Tasks;
