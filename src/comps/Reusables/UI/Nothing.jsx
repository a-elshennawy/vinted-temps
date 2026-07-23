import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import nothingLottie from "../../../assets/lotties/nothing.json?url";

function Nothing() {
  return (
    <div className="pt-4">
      <DotLottieReact src={nothingLottie} loop autoplay />
    </div>
  );
}

export default Nothing;
