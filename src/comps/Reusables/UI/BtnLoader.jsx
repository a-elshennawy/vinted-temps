import { TailSpin } from "react-loader-spinner";

function BtnLoader({ color = "#fff" }) {
  return (
    <>
      <TailSpin
        visible={true}
        height="18"
        width="18"
        color={color}
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </>
  );
}

export default BtnLoader;
