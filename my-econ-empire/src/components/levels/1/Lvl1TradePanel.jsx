import React, { useState } from "react";
import CustomSlider from "../../CustomSlider.jsx";
import meatIcon from "../../../assets/icons/meat.png";
import berryIcon from "../../../assets/icons/berries.png";
import Switch from "../../Switch.jsx";

const Lvl1TradePanel = ({
  setMeatTradeValueGlobal,
  setBerriesTradeValueGlobal,
  setMeatTradeSend,
  setBerriesTradeSend,
  tradeSubmitted = false,
}) => {
  const [meatTradeValue, setMeatTradeValue] = useState(0);
  const [berriesTradeValue, setBerriesTradeValue] = useState(0);

  const handleSliderChange = (type, newValue) => {
    newValue = parseInt(newValue, 10);
    type === "meat"
      ? setMeatTradeValue(newValue)
      : setBerriesTradeValue(newValue);
    type === "meat"
      ? setMeatTradeValueGlobal(newValue)
      : setBerriesTradeValueGlobal(newValue);
  };

  return (
    <div className="bg-stone-900 px-4 py-3 rounded-2xl border border-stone-700 font-medium mt-5">
      {[
        {
          icon: meatIcon,
          label: "Meat",
          value: meatTradeValue,
          setTradeSend: setMeatTradeSend,
          setValue: (v) => handleSliderChange("meat", v),
        },
        {
          icon: berryIcon,
          label: "Berries",
          value: berriesTradeValue,
          setTradeSend: setBerriesTradeSend,
          setValue: (v) => handleSliderChange("berries", v),
        },
      ].map(({ icon, label, value, setTradeSend, setValue }) => (
        <div
          key={label}
          className="grid grid-cols-1 md:grid-cols-[1fr_4fr_3fr] text-stone-50 gap-6 md:gap-10 items-center text-lg mt-2 bg-stone-800 rounded-2xl border border-stone-700 px-10 py-3"
        >
          <div
            className={`flex flex-col mb-2 md:mb-0 items-center md:items-start`}
          >
            <img width={50} src={icon} alt={label} />
            <span>{label}</span>
          </div>
          <div className="flex items-end justify-center h-full mb-6">
            <CustomSlider
              max={100}
              value={value}
              disabled={tradeSubmitted}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="flex items-end justify-center space-x-2 md:mt-5 bg-stone-700 text-stone-50 px-3 py-2 rounded-lg text-lg">
            <Switch withTrader={false} setTradeSend={setTradeSend} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Lvl1TradePanel;
