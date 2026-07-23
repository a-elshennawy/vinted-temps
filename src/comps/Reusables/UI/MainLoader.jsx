import { InfinitySpin } from "react-loader-spinner";

function MainLoader({ size, color }) {
  return (
    <>
      <div className="mainLoader">
        <InfinitySpin width={size} color={color} />
      </div>
    </>
  );
}

export default MainLoader;
