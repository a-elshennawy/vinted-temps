import InputComp from "../Reusables/InputComp";
import TempsList from "../Reusables/TempsList";

function Home() {
  return (
    <>
      <div className="row justify-content-evenly align-items-start gap-1 m-0">
        <InputComp />
        <TempsList />
      </div>
    </>
  );
}

export default Home;
