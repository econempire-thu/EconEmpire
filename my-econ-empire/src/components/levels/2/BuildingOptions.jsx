import React, { useState } from "react";
import {
  BUILDING_COST_TIMBER,
  LVL_2_MULTIPLIERS_BUILDINGS,
} from "../../../Constants.jsx";
import Timber from "../../../assets/icons/timber.png";
import { Check } from "lucide-react";
import { updateUserField } from "../../../services/userService.js";

function BuildingOptions({
  possibleBuildings,
  villageLetter,
  timber,
  refreshData,
  user,
}) {
  const [selectedBuildings, setSelectedBuildings] = useState([]);

  const mappings = {
    "Meat Camp": "MEAT_AND_CAMP",
    "Berries Hut": "BERRIES_AND_HUT",
    "Timber Lodge": "TIMBER_AND_LODGE",
  };

  const dbMappings = {
    "Meat Camp": "meatCamp",
    "Berries Hut": "berriesHut",
    "Timber Lodge": "timberLodge",
  };

  const handleBuildingClick = (buildingName) => {
    setSelectedBuildings((prevSelected) => {
      if (prevSelected.includes(buildingName)) {
        return prevSelected.filter((item) => item !== buildingName); // Deselect
      } else {
        return [...prevSelected, buildingName]; // Select
      }
    });
  };

  // Calculate the total timber cost for the selected buildings
  const totalTimberCost = selectedBuildings.length * 20;

  // Check if the user has enough timber
  const isEnoughTimber = timber >= totalTimberCost;

  return (
    <div className="bg-stone-900 px-4 py-3 rounded-2xl border border-stone-700 font-medium mt-5">
      <h2 className="text-xl mb-3 text-white">Building Options</h2>
      <p className="inline-flex items-center text-stone-300 mb-5 text-lg italic">
        20{" "}
        <img className="size-7 inline-block mx-2" src={Timber} alt="Timber" />{" "}
        per building, completed in the next turn
      </p>

      <div className="flex gap-x-4">
        {Object.entries(possibleBuildings).map(
          ([name, has]) =>
            !has && (
              <li
                key={name}
                onClick={() => handleBuildingClick(name)}
                className={`flex items-center justify-between w-full pb-1 rounded-xl border text-stone-200 py-1 px-3 cursor-pointer
                  ${selectedBuildings.includes(name) ? "bg-blue-500/30 border-blue-500" : "bg-stone-800 border-stone-700"}`}
              >
                <div className="flex flex-col items-center">
                  <span className="uppercase text-sm font-light">{name}</span>
                  <span className="text-xl">
                    {
                      LVL_2_MULTIPLIERS_BUILDINGS[villageLetter][mappings[name]]
                        .MULTIPLIER
                    }{" "}
                    ^{" "}
                    {
                      LVL_2_MULTIPLIERS_BUILDINGS[villageLetter][mappings[name]]
                        .POWER
                    }
                  </span>
                </div>
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBuildings.includes(name)}
                    onChange={() => handleBuildingClick(name)}
                    className="hidden peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-lg peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed flex items-center justify-center transition-all">
                    {selectedBuildings.includes(name) && (
                      <Check className={`text-white`} />
                    )}
                  </div>
                </label>
              </li>
            ),
        )}
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={async () => {
            for (const building of selectedBuildings) {
              await updateUserField(dbMappings[building], true);
            }
            await updateUserField("timber", timber - totalTimberCost);
            refreshData(user);
          }}
          disabled={!isEnoughTimber}
          className={`cursor-pointer px-6 py-2 font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 ${
            isEnoughTimber
              ? "bg-stone-300 text-stone-800 hover:px-8 hover:bg-stone-200"
              : "bg-stone-500 text-stone-300 cursor-not-allowed"
          }`}
        >
          {isEnoughTimber ? "Build" : "Not enough Timber"}
        </button>
      </div>
    </div>
  );
}

export default BuildingOptions;
