import React, { useEffect, useState } from "react";
import CustomSlider from "../../CustomSlider.jsx";
import meatIcon from "../../../assets/icons/meat.png";
import berryIcon from "../../../assets/icons/berries.png";
import timberIcon from "../../../assets/icons/timber.png";
import {
  LVL_2_MULTIPLIERS,
  LVL_2_MULTIPLIERS_BUILDINGS,
} from "../../../Constants.jsx";

const Lvl2Turn6ProductionPanel = ({
  setMeatProductionValue,
  setBerriesProductionValue,
  setTimberProductionValue,
  setMeatSliderValue,
  setBerriesSliderValue,
  setTimberSliderValue,
  villageLetter,
  productionSet,
  setProductionSet,
  hasMeatCamp,
  hasBerriesHut,
  hasTimberLodge,
}) => {
  const [meat, setMeat] = useState(34);
  const [berries, setBerries] = useState(33);
  const [timber, setTimber] = useState(33);
  const maxTotal = 100;

  const meatMultiplier = hasMeatCamp
    ? LVL_2_MULTIPLIERS_BUILDINGS[villageLetter].MEAT_AND_CAMP
    : LVL_2_MULTIPLIERS[villageLetter].MEAT;

  const berriesMultiplier = hasBerriesHut
    ? LVL_2_MULTIPLIERS_BUILDINGS[villageLetter].BERRIES_AND_HUT
    : LVL_2_MULTIPLIERS[villageLetter].BERRIES;

  const timberMultiplier = hasTimberLodge
    ? LVL_2_MULTIPLIERS_BUILDINGS[villageLetter].TIMBER_AND_LODGE
    : LVL_2_MULTIPLIERS[villageLetter].TIMBER;

  useEffect(() => {
    const calculateFinalProduction = (
      base,
      hasBuilding,
      buildingKey,
      normalMultiplier,
    ) => {
      if (hasBuilding) {
        const { MULTIPLIER, POWER } =
          LVL_2_MULTIPLIERS_BUILDINGS[villageLetter][buildingKey];
        return Math.round(MULTIPLIER * Math.pow(base, POWER));
      } else {
        const multiplier = LVL_2_MULTIPLIERS[villageLetter][normalMultiplier];
        return Math.round(base * multiplier);
      }
    };

    const roundedMeat = calculateFinalProduction(
      meat,
      hasMeatCamp,
      "MEAT_AND_CAMP",
      "MEAT",
    );
    const roundedBerries = calculateFinalProduction(
      berries,
      hasBerriesHut,
      "BERRIES_AND_HUT",
      "BERRIES",
    );
    const roundedTimber = calculateFinalProduction(
      timber,
      hasTimberLodge,
      "TIMBER_AND_LODGE",
      "TIMBER",
    );

    setMeatProductionValue(roundedMeat);
    setBerriesProductionValue(roundedBerries);
    setTimberProductionValue(roundedTimber);

    setMeatSliderValue(meat);
    setBerriesSliderValue(berries);
    setTimberSliderValue(timber);
  }, [
    meat,
    berries,
    timber,
    hasMeatCamp,
    hasBerriesHut,
    hasTimberLodge,
    villageLetter,
  ]);

  const formatProduction = (value, multiplier) => {
    if (typeof multiplier === "number") {
      return Math.round(value * multiplier);
    } else if (
      typeof multiplier === "object" &&
      multiplier?.MULTIPLIER &&
      multiplier?.POWER
    ) {
      return Math.round(
        multiplier.MULTIPLIER * Math.pow(value, multiplier.POWER),
      );
    }
    return value; // fallback in case of invalid input
  };

  const handleSliderChange = (type, newValue) => {
    setProductionSet(false);
    newValue = parseInt(newValue, 10);

    const otherValues =
      type === "meat"
        ? berries + timber
        : type === "berries"
          ? meat + timber
          : meat + berries; // For timber

    // Allow decreasing always
    if (
      newValue <
      (type === "meat" ? meat : type === "berries" ? berries : timber)
    ) {
      if (type === "meat") {
        setMeat(newValue);
        setMeatProductionValue(newValue);
      } else if (type === "berries") {
        setBerries(newValue);
        setBerriesProductionValue(newValue);
      } else {
        setTimber(newValue);
        setTimberProductionValue(newValue);
      }
      return;
    }

    // Prevent increasing beyond maxTotal
    if (newValue + otherValues <= maxTotal) {
      if (type === "meat") {
        setMeat(newValue);
        setMeatProductionValue(newValue);
      } else if (type === "berries") {
        setBerries(newValue);
        setBerriesProductionValue(newValue);
      } else {
        setTimber(newValue);
        setTimberProductionValue(newValue);
      }
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
        {
          icon: timberIcon,
          label: "Timber",
          value: timber,
          multiplier: timberMultiplier,
          setValue: (v) => handleSliderChange("timber", v),
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
              disabled={productionSet}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="flex items-end justify-center space-x-2 md:mt-5 bg-stone-700 text-stone-50 px-3 py-1 rounded-lg text-lg">
            <span className="font-semibold italic">
              {typeof multiplier === "object" ? multiplier?.MULTIPLIER : value}
            </span>
            <span className="text-stone-400">×</span>
            <span className="font-semibold">
              {typeof multiplier === "object" && multiplier?.MULTIPLIER
                ? `${value} ^ ${multiplier?.POWER}`
                : multiplier}
            </span>
            <span className="text-stone-400">=</span>
            <span className="font-semibold text-emerald-300">
              {formatProduction(value, multiplier)}
            </span>
          </div>
        </div>
      ))}

      <div
        className={`mt-2 ${maxTotal - (meat + berries + timber) === 0 ? "text-stone-50" : "text-red-400"} font-semibold text-center px-4 py-2 rounded-xl`}
      >
        {maxTotal - (meat + berries + timber) !== 0 && "! "}Free Villagers:{" "}
        {maxTotal - (meat + berries + timber)}
      </div>
    </div>
  );
};

export default Lvl2Turn6ProductionPanel;
