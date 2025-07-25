import coinIcon from "../assets/icons/coin.png";

function Coin({ coin, className }) {
  return (
    <div
      className={`rounded-xl bg-black/80 px-3 py-1 tracking-wide font-semibold flex space-x-4 md:text-lg lg:text-xl text-white shadow-amber-500/30 shadow-2xl z-10 items-center ${className}`}
    >
      <img src={coinIcon} className={`size-5 md:size-8`} alt={"Coin"} />
      <p>{coin}</p>
    </div>
  );
}

export default Coin;
