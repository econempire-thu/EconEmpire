import React, { useEffect, useState } from "react";
import CustomSlider from "../../CustomSlider.jsx";
import meatIcon from "../../../assets/icons/meat.png";
import berryIcon from "../../../assets/icons/berries.png";
import { LVL_1_MULTIPLIERS } from "../../../Constants.jsx";

const Lvl1ProductionPanel = ({
  setMeatProductionValue,
  setBerriesProductionValue,
  setMeatSliderValue,
  setBerriesSliderValue,
  villageLetter,
  setProductionSet,
  tradeSubmitted = false,
}) => {
  const [meat, setMeat] = useState(() => {
    console.log(localStorage.getItem("meatSliderValue"));
    const storedMeat = parseInt(localStorage.getItem("meatSliderValue"));
    console.log(storedMeat);
    return isNaN(storedMeat) ? 50 : storedMeat;
  });

  const [berries, setBerries] = useState(() => {
    const storedBerries = parseInt(localStorage.getItem("berriesSliderValue"));
    return isNaN(storedBerries) ? 50 : storedBerries;
  });

  const maxTotal = 100;
  const meatMultiplier = LVL_1_MULTIPLIERS[villageLetter].MEAT;
  const berriesMultiplier = LVL_1_MULTIPLIERS[villageLetter].BERRIES;
  useEffect(() => {
    setMeatProductionValue(meat * meatMultiplier);
    setBerriesProductionValue(berries * berriesMultiplier);
    setMeatSliderValue(meat);
    setBerriesSliderValue(berries);
  }, [meat, berries]);

  const formatProduction = (value, multiplier) =>
    Math.round(value * multiplier);

  const handleSliderChange = (type, newValue) => {
    setProductionSet(false);
    newValue = parseInt(newValue, 10);
    const otherValue = type === "meat" ? berries : meat;

    // Allow decreasing always
    if (newValue < (type === "meat" ? meat : berries)) {
      type === "meat" ? setMeat(newValue) : setBerries(newValue);
      type === "meat"
        ? setMeatProductionValue(newValue)
        : setBerriesProductionValue(newValue);
      return;
    }

    // Prevent increasing beyond maxTotal
    if (newValue + otherValue <= maxTotal) {
      type === "meat" ? setMeat(newValue) : setBerries(newValue);
      type === "meat"
        ? setMeatProductionValue(newValue)
        : setBerriesProductionValue(newValue);
    }
  };

  return (
    <div className="bg-stone-900 px-4 py-3 rounded-2xl border border-stone-700 font-medium mt-5">
      {[
        {
          icon: meatIcon,
          label: "Meat",
          value: meat,
          multiplier: meatMultiplier,
          setValue: (v) => handleSliderChange("meat", v),
        },
        {
          icon: berryIcon,
          label: "Berries",
          value: berries,
          multiplier: berriesMultiplier,
          setValue: (v) => handleSliderChange("berries", v),
        },
      ].map(({ icon, label, value, multiplier, setValue }) => (
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
              max={"100"}
              disabled={tradeSubmitted}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="flex items-end justify-center space-x-2 md:mt-5 bg-stone-700 text-stone-50 px-3 py-1 rounded-lg text-lg">
            <span className="font-semibold italic">{value}</span>
            <span className="text-stone-400">×</span>
            <span className="font-semibold">{multiplier}</span>
            <span className="text-stone-400">=</span>
            <span className="font-semibold text-emerald-300">
              {formatProduction(value, multiplier)}
            </span>
          </div>
        </div>
      ))}

      <div
        className={`mt-2 ${maxTotal - (meat + berries) === 0 ? "text-stone-50" : "text-red-400"} font-semibold text-center px-4 py-2 rounded-xl`}
      >
        {maxTotal - (meat + berries) !== 0 && "! "}Free Villagers:{" "}
        {maxTotal - (meat + berries)}
      </div>
    </div>
  );
};

export default Lvl1ProductionPanel;
