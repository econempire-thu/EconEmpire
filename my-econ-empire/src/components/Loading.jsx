import React from "react";

function Loading(props) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-stone-950 text-stone-50">
      {/* Simple loading spinner */}
      <div className="animate-spin border-t-4 border-b-4 border-stone-50 w-16 h-16 rounded-full"></div>
    </div>
  );
}

export default Loading;
