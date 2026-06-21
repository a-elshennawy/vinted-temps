import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLoader from "./comps/Reusables/UI/MainLoader";
import Layout from "./comps/Layout/Layout";

const Home = lazy(() => import("./Pages/Home/Home"));
const Auth = lazy(() => import("./Pages/Auth/Auth"));
const Pending = lazy(() => import("./Pages/Pending/Pending"));
const Agents = lazy(() => import("./Pages/Agents/Agents"));

// fresh sessions always
const APP_VERSION = "1.0.5";

if (localStorage.getItem("appVersion") !== APP_VERSION) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("appVersion", APP_VERSION);
  window.location.reload();
}

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<MainLoader size={200} color="var(--first)" />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="agents" element={<Agents />} />
              <Route path="pending" element={<Pending />} />
            </Route>
            <Route path="/auth/:logType" element={<Auth />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
