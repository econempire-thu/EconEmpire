function StartButton({ label, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-6 hover:px-8 py-2 text-sm md:text-lg lg:text-2xl font-semibold rounded-full transition-all ease-in-out duration-200 bg-emerald-300 text-emerald-800 hover:bg-emerald-200 ${className}`}
    >
      {label}
    </button>
  );
}

export default StartButton;
