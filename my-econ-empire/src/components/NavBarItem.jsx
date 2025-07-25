function NavBarItem({ label, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      className={`hover:text-stone-300 flex md:flex-col cursor-pointer px-4 py-2 text-2xl md:text-sm font-medium tracking-wide rounded-lg items-center transition-all ease-in-out duration-200 ${selected ? "text-white" : "text-stone-500"}`}
    >
      {label}
      {selected && (
        <span className="block mt-1 md:mx-auto ml-2 md:h-1 md:w-1 h-2 w-2 bg-white rounded-full"></span>
      )}
    </button>
  );
}

export default NavBarItem;
