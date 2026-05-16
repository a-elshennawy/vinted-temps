import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import EmptyNotifications from "../../../assets/lotties/EmptyNotifications.json?url";

function NoPending() {
  return (
    <div className="pt-4">
      <DotLottieReact src={EmptyNotifications} loop autoplay />
    </div>
  );
}

export default NoPending;
