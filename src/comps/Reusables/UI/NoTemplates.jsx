import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import notFoundUrl from "../../../assets/lotties/notFound.json?url";

function NoTemplates() {
  return (
    <div className="pt-4">
      <DotLottieReact src={notFoundUrl} loop autoplay />
    </div>
  );
}

export default NoTemplates;
