import { Crown } from "lucide-react";

function Score({ score, add, className }) {
  // Compute the bonus display string if add is not null.
  const addDisplay =
    add !== undefined && add !== null && (add >= 0 ? `+${add}` : `${add}`);

  return (
    <div
      className={`rounded-full bg-amber-200 px-3 py-1 tracking-wide font-semibold flex space-x-4 md:text-lg lg:text-xl text-amber-950 shadow-amber-500/30 shadow-2xl z-10 items-center ${className}`}
    >
      <Crown className={`size-5 md:size-6`} />
      <p>{score}</p>
      {add !== undefined && add !== null && (
        <span className="text-amber-800 italic">{addDisplay}</span>
      )}
    </div>
  );
}

export default Score;
