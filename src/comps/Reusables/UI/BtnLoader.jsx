import { TailSpin } from "react-loader-spinner";

function BtnLoader() {
  return (
    <>
      <TailSpin
        visible={true}
        height="18"
        width="18"
        color="#fff"
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </>
  );
}

export default BtnLoader;
