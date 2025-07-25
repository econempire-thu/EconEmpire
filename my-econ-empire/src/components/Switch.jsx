import React, { useState } from "react";

const Switch = ({ setTradeSend, withTrader }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setTradeSend(!isChecked);
    setIsChecked(!isChecked);
  };

  return (
    <label className="flex cursor-pointer select-none items-center space-x-3">
      <span
        className={`transition ${!isChecked ? "text-white" : "text-stone-400"}`}
      >
        {withTrader ? "Buy" : "Receive"}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="sr-only"
        />
        <div
          className={`box block h-8 w-14 rounded-full transition ${
            isChecked ? "bg-blue-500" : "bg-green-500"
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition ${
            isChecked ? "translate-x-full" : ""
          }`}
        ></div>
      </div>
      <span
        className={`transition ${isChecked ? "text-white" : "text-stone-400"}`}
      >
        {withTrader ? "Sell" : "Send"}
      </span>
    </label>
  );
};

export default Switch;
