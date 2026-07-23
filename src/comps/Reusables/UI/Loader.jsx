import { InfinitySpin } from "react-loader-spinner";

function Loader({ size, color }) {
  return (
    <>
      <div className="loaderComp p-2">
        <InfinitySpin width={size} color={color} />
      </div>
    </>
  );
}

export default Loader;
