import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import thinking from "../../../assets/lotties/thinking.json?url";

function ThinkingComp() {
  return (
    <div className="pt-4">
      <DotLottieReact src={thinking} loop autoplay />
    </div>
  );
}

export default ThinkingComp;
