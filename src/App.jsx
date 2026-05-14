import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLoader from "./comps/Reusables/UI/MainLoader";

const Home = lazy(() => import("./comps/Home/Home"));

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<MainLoader size={200} color="var(--first)" />}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
