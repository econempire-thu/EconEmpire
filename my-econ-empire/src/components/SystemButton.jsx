import React from "react";

function SystemButton({
  label,
  onClick,
  type = "button",
  loadingSignIn = false,
}) {
  return (
    <button
      type={type}
      disabled={loadingSignIn}
      onClick={onClick}
      className="cursor-pointer px-10 hover:px-12 self-start py-2 text-xl text-center mt-2 mx-auto font-semibold rounded-full transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
    >
      {label}
    </button>
  );
}

export default SystemButton;
