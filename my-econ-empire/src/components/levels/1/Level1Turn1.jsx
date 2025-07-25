import React, { useState } from "react";
import Lvl1ProductionPanel from "./Lvl1ProductionPanel.jsx";
import Results from "../../Results.jsx";

function Level1Turn1({ onResultsOpen, score, villageLetter, levelTurnKey }) {
  const [meatProductionValue, setMeatProductionValue] = useState(0);
  const [berriesProductionValue, setBerriesProductionValue] = useState(0);
  const [meatSliderValue, setMeatSliderValue] = useState(50);
  const [berriesSliderValue, setBerriesSliderValue] = useState(50);
  const totalVillagers = 100;
  const [showResults, setShowResults] = useState(false);
  const [happy, setHappy] = useState(null);
  const [content, setContent] = useState(null);
  const [sad, setSad] = useState(null);
  const [angry, setAngry] = useState(null);
  const [productionSet, setProductionSet] = useState(false);

  const getAngryCount = (totalProductionValue) => {
    return totalProductionValue < totalVillagers
      ? Math.round(totalVillagers - totalProductionValue)
      : 0;
  };

  const getHappyCount = (totalProductionValue) => {
    if (
      Math.max(meatProductionValue, berriesProductionValue) >= totalVillagers
    ) {
      return Math.round(
        Math.min(
          Math.min(meatProductionValue, berriesProductionValue),
          totalVillagers,
        ),
      );
    } else if (
      Math.max(meatProductionValue, berriesProductionValue) < totalVillagers &&
      getAngryCount(totalProductionValue) === 0
    ) {
      return Math.round(totalProductionValue - totalVillagers);
    } else {
      return 0;
    }
  };

  const getSadCount = (totalProductionValue) => {
    const angryCount = getAngryCount(totalProductionValue);
    if (angryCount > 0) {
      return Math.round(totalVillagers - angryCount);
    } else if (angryCount <= 0 && totalProductionValue < 2 * totalVillagers) {
      return Math.round(2 * totalVillagers - totalProductionValue);
    } else {
      return 0;
    }
  };

  const getContentCount = (totalProductionValue) => {
    return Math.round(
      totalVillagers -
        getHappyCount(totalProductionValue) -
        getSadCount(totalProductionValue) -
        getAngryCount(totalProductionValue),
    );
  };

  const calculateResults = () => {
    const totalProductionValue = Math.round(
      meatProductionValue + berriesProductionValue,
    );
    const angryNumber = getAngryCount(totalProductionValue);
    const happyNumber = getHappyCount(totalProductionValue);
    const sadNumber = getSadCount(totalProductionValue);
    const contentNumber = getContentCount(totalProductionValue);

    setHappy(happyNumber);
    setContent(contentNumber);
    setSad(sadNumber);
    setAngry(angryNumber);

    setShowResults(true);
    onResultsOpen(true);
  };

  return (
    <div className="flex flex-grow w-full justify-center">
      {/* Production Panel */}
      <div className="w-full ml-5 mr-2.5 mb-5 max-w-3xl">
        <Lvl1ProductionPanel
          villageLetter={villageLetter}
          setMeatSliderValue={setMeatSliderValue}
          setBerriesSliderValue={setBerriesSliderValue}
          setMeatProductionValue={setMeatProductionValue}
          setBerriesProductionValue={setBerriesProductionValue}
          setProductionSet={setProductionSet}
        />
        <div className="flex justify-center mt-5">
          <button
            onClick={calculateResults}
            className="cursor-pointer px-6 hover:px-8 py-2 text-xl font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
          >
            Set Values
          </button>
        </div>
      </div>

      {/* Sidebar Results */}
      <div className="flex flex-col">
        <Results
          levelTurnKey={levelTurnKey}
          happy={happy}
          content={content}
          sad={sad}
          angry={angry}
          score={score}
          externalLevelData={{
            MeatProductionValue: meatProductionValue,
            BerriesProductionValue: berriesProductionValue,
          }}
          meatSliderValue={meatSliderValue}
          berriesSliderValue={berriesSliderValue}
          isResultOpen={showResults}
          onClose={() => {
            setShowResults(false);
          }}
        />
      </div>
    </div>
  );
}

export default Level1Turn1;
