import InputComp from "../../comps/Reusables/InputComp";
import TempsList from "../../comps/Reusables/TempsList";

function Home() {
  return (
    <>
      <title>Temp Store | Home</title>
      <div className="row justify-content-evenly align-items-start gap-1 m-0">
        <InputComp />
        <TempsList />
      </div>
    </>
  );
}

export default Home;
