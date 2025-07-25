import riceIcon from "../assets/icons/rice.png";

function Rice({ rice, className }) {
  return (
    <div
      className={`rounded-xl bg-black/80 px-3 py-1 tracking-wide font-semibold flex space-x-4 md:text-lg lg:text-xl text-white shadow-amber-500/30 shadow-2xl z-10 items-center ${className}`}
    >
      <img src={riceIcon} className={`size-5 md:size-8`} alt={"Rice"} />
      <p>{rice}</p>
    </div>
  );
}

export default Rice;
