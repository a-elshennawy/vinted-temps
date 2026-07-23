import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import LockedLottie from "../../../assets/lotties/locked.json?url";

function Locked() {
  return (
    <div className="pt-4">
      <DotLottieReact src={LockedLottie} loop autoplay />
    </div>
  );
}

export default Locked;
