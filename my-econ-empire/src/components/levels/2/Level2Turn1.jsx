import React, { useEffect, useMemo, useState } from "react";
import Results from "../../Results.jsx";
import TraderTable from "./TraderTable.jsx";
import Lvl2ProductionPanel from "./Lvl2ProductionPanel.jsx";
import Lvl2TradePanel from "./Lvl2TradePanel.jsx";
import AlertPopup from "../../AlertPopup.jsx";
import ResourceDisplay from "./ResourceDisplay.jsx";
import {
  getLevelData,
  useEndTradingPhaseLvl2,
  useSetTradeValueLvl2,
  useUpdateUserField,
} from "../../../utils/firebase/Firestore.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Level2Turn1({
  onResultsOpen,
  score,
  villageLetter,
  levelTurnKey,
  timberStored,
  coinsStored,
  refreshData,
  user,
  setMeat,
  setBerries,
  setRice,
  setBeer,
  setSalt,
}) {
  const navigate = useNavigate();
  const [meatProductionValue, setMeatProductionValue] = useState(0);
  const [berriesProductionValue, setBerriesProductionValue] = useState(0);
  const [timberProductionValue, setTimberProductionValue] = useState(0);
  const [riceValue, setRiceValue] = useState(0);
  const [beerValue, setBeerValue] = useState(0);
  const [saltValue, setSaltValue] = useState(0);
  const totalVillagers = 100;
  const updateUserField = useUpdateUserField();
  const [showResults, setShowResults] = useState(false);
  const [happy, setHappy] = useState(null);
  const [content, setContent] = useState(null);
  const [sad, setSad] = useState(null);
  const [angry, setAngry] = useState(null);
  const setTradeValue = useSetTradeValueLvl2();
  const setTradeCompleted = useEndTradingPhaseLvl2();
  const [productionSet, setProductionSet] = useState(false);
  const [meatTradeSell, setMeatTradeSell] = useState(false);
  const [berriesTradeSell, setBerriesTradeSell] = useState(false);
  const [timberTradeSell, setTimberTradeSell] = useState(false);
  const [riceTradeSell, setRiceTradeSell] = useState(false);
  const [beerTradeSell, setBeerTradeSell] = useState(false);
  const [saltTradeSell, setSaltTradeSell] = useState(false);
  const [tradeTotals, setTradeTotals] = useState({});
  const [unavailableItem, setUnavailableItem] = useState(null);
  const [productionExists, setProductionExists] = useState(false);
  const [tradeGoldTotal, setTradeGoldTotal] = useState(0);
  const [tradeEnded, setTradeEnded] = useState(false);
  const [availableResources, setAvailableResources] = useState({
    meat: Math.round(meatProductionValue),
    berries: Math.round(berriesProductionValue),
    timber: Math.round(timberProductionValue) + timberStored,
    rice: Math.round(riceValue),
    beer: Math.round(beerValue),
    salt: Math.round(saltValue),
  });

  const [showAlertCoinShortage, setShowAlertCoinShortage] = useState(false);
  const [showAlertResourceShortage, setShowAlertResourceShortage] =
    useState(false);

  const tradeSell = useMemo(
    () => ({
      meat: meatTradeSell,
      berries: berriesTradeSell,
      timber: timberTradeSell,
      rice: riceTradeSell,
      beer: beerTradeSell,
      salt: saltTradeSell,
    }),
    [
      meatTradeSell,
      berriesTradeSell,
      timberTradeSell,
      riceTradeSell,
      beerTradeSell,
      saltTradeSell,
    ],
  );

  const setTradeSell = useMemo(
    () => ({
      meat: setMeatTradeSell,
      berries: setBerriesTradeSell,
      timber: setTimberTradeSell,
      rice: setRiceTradeSell,
      beer: setBeerTradeSell,
      salt: setSaltTradeSell,
    }),
    [
      setMeatTradeSell,
      setBerriesTradeSell,
      setTimberTradeSell,
      setRiceTradeSell,
      setBeerTradeSell,
      setSaltTradeSell,
    ],
  );

  const loadData = async (user) => {
    const levelData = await getLevelData(levelTurnKey, user);
    if (levelData) {
      setMeatProductionValue(levelData.meat);
      setBerriesProductionValue(levelData.berries);
      setTimberProductionValue(timberStored);
      setRiceValue(levelData.rice);
      setBeerValue(levelData.beer);
      setSaltValue(levelData.salt);
      setTradeGoldTotal(levelData.gold);
      setTradeEnded(levelData.tradeCompleted || false);
      setAvailableResources({
        meat: levelData.meat,
        berries: levelData.berries,
        timber: timberStored,
        rice: levelData.rice,
        beer: levelData.beer,
        salt: levelData.salt,
      });
      setMeat(levelData.meat);
      setBerries(levelData.berries);
      setRice(levelData.rice);
      setBeer(levelData.beer);
      setSalt(levelData.salt);
    }
    setProductionExists(levelData !== null);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData(user);
      } else {
        // If user is not authenticated, navigate to login
        navigate("/log-in");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const getAngryCount = (sumOfMBR) => {
    return sumOfMBR < 2 * totalVillagers
      ? Math.min(100, 2 * totalVillagers - sumOfMBR)
      : 0;
  };

  const getHappyCount = (maxOfMBR, sumMinusMax, sumOfMBR) => {
    const angryCount = getAngryCount(sumOfMBR);

    return Math.min(
      availableResources.beer,
      availableResources.salt,
      Math.floor(tradeGoldTotal / 10),
      maxOfMBR >= totalVillagers
        ? Math.min(sumMinusMax, 100)
        : angryCount > 0
          ? totalVillagers - angryCount
          : totalVillagers,
    );
  };

  const getSadCount = (maxOfMBR, sumMinusMax) => {
    let result = 0;
    if (maxOfMBR > 100 && sumMinusMax < 0) {
      result = Math.min(100 - sumMinusMax, maxOfMBR - 100);
    }
    return result;
  };

  const getContentCount = (sumOfMBR, maxOfMBR, sumMinusMax) => {
    return (
      totalVillagers -
      getHappyCount(maxOfMBR, sumMinusMax, sumOfMBR) -
      getSadCount(maxOfMBR, sumMinusMax) -
      getAngryCount(sumOfMBR)
    );
  };

  const calcTradeValues = async () => {
    const tradeItems = ["meat", "berries", "timber", "rice", "beer", "salt"];

    const tradeSellStates = {
      meat: meatTradeSell,
      berries: berriesTradeSell,
      timber: timberTradeSell,
      rice: riceTradeSell,
      beer: beerTradeSell,
      salt: saltTradeSell,
    };

    for (let item of tradeItems) {
      // If the user is selling this resource,
      // ensure they have enough available.
      if (tradeSellStates[item]) {
        // When selling, tradeTotals[item] should be a negative value,
        // so we take the absolute value as the required quantity.
        const requiredAmount = Math.abs(tradeTotals[item] || 0);

        if (availableResources[item] < requiredAmount) {
          setUnavailableItem(item);
          setShowAlertResourceShortage(true);
          return; // Exit if any resource requirement isn't met.
        }
      }
    }

    if (tradeTotals.gold < 0) {
      const coinCost = Math.abs(tradeTotals.gold);
      if (coinsStored < coinCost) {
        setShowAlertCoinShortage(true);
        return; // Exit if coin requirement isn't met.
      }
    }

    await updateUserField("gold", coinsStored + tradeTotals.gold);
    await updateUserField("timber", timberStored + tradeTotals.timber);
    const submitted = await setTradeValue(
      levelTurnKey,
      meatProductionValue + tradeTotals.meat,
      berriesProductionValue + tradeTotals.berries,
      riceValue + tradeTotals.rice,
      beerValue + tradeTotals.beer,
      saltValue + tradeTotals.salt,
      tradeGoldTotal + tradeTotals.gold,
    );

    if (submitted) {
      refreshData(user);
      setAvailableResources({
        meat: meatProductionValue + tradeTotals.meat,
        berries: berriesProductionValue + tradeTotals.berries,
        timber: timberProductionValue + tradeTotals.timber,
        rice: riceValue + tradeTotals.rice,
        beer: beerValue + tradeTotals.beer,
        salt: saltValue + tradeTotals.salt,
      });

      setMeat(meatProductionValue + tradeTotals.meat);
      setBerries(berriesProductionValue + tradeTotals.berries);
      setRice(riceValue + tradeTotals.rice);
      setBeer(beerValue + tradeTotals.beer);
      setSalt(saltValue + tradeTotals.salt);

      setMeatProductionValue((prevValue) => prevValue + tradeTotals.meat);
      setBerriesProductionValue((prevValue) => prevValue + tradeTotals.berries);
      setTimberProductionValue((prevValue) => prevValue + tradeTotals.timber);
      setRiceValue((prevValue) => prevValue + tradeTotals.rice);
      setBeerValue((prevValue) => prevValue + tradeTotals.beer);
      setSaltValue((prevValue) => prevValue + tradeTotals.salt);
      setTradeGoldTotal(tradeGoldTotal + tradeTotals.gold);
    }

    setTradeTotals({
      meat: 0,
      berries: 0,
      timber: 0,
      rice: 0,
      beer: 0,
      salt: 0,
      gold: 0,
    });
  };

  const calculateResults = () => {
    const ended = setTradeCompleted(levelTurnKey, true);
    if (ended) {
      setTradeEnded(true);
      const maxOfMBR = Math.max(
        availableResources.meat,
        availableResources.berries,
        availableResources.rice,
      );
      const sumOfMBR =
        availableResources.meat +
        availableResources.berries +
        availableResources.rice;
      const sumMinusMax = sumOfMBR - maxOfMBR;

      const angryNumber = getAngryCount(sumOfMBR);
      const happyNumber = getHappyCount(maxOfMBR, sumMinusMax, sumOfMBR);
      const sadNumber = getSadCount(maxOfMBR, sumMinusMax);
      const contentNumber = getContentCount(sumOfMBR, maxOfMBR, sumMinusMax);

      setHappy(happyNumber);
      setContent(contentNumber);
      setSad(sadNumber);
      setAngry(angryNumber);

      setShowResults(true);
      onResultsOpen(true);
    }
  };

  const handleProductionSet = async () => {
    setProductionExists(true);
    await updateUserField("timber", timberProductionValue + timberStored);
    refreshData(user);
    setAvailableResources({
      meat: meatProductionValue,
      berries: berriesProductionValue,
      timber: timberProductionValue + timberStored,
      rice: 0,
      beer: 0,
      salt: 0,
    });

    setMeat(meatProductionValue);
    setBerries(berriesProductionValue);
    await setTradeValue(
      levelTurnKey,
      meatProductionValue,
      berriesProductionValue,
      0,
      0,
      0,
      0,
    );
  };
  return (
    <div className="flex flex-grow w-full justify-center">
      {/* Production Panel */}
      <div className="w-full ml-5 mr-2.5 mb-5 max-w-4xl">
        {showAlertCoinShortage && (
          <AlertPopup
            message="You do not have enough coins to complete this trade."
            onClose={() => setShowAlertCoinShortage(false)}
          />
        )}
        {showAlertResourceShortage && (
          <AlertPopup
            message={`You do not have enough ${unavailableItem} to sell.`}
            onClose={() => setShowAlertResourceShortage(false)}
          />
        )}
        <>
          {!productionSet && !productionExists && (
            <>
              <p className={`text-white text-2xl font-medium text-center mt-5`}>
                Production
              </p>
              <Lvl2ProductionPanel
                villageLetter={villageLetter}
                setMeatProductionValue={setMeatProductionValue}
                setBerriesProductionValue={setBerriesProductionValue}
                setTimberProductionValue={setTimberProductionValue}
                productionSet={productionSet}
                setProductionSet={setProductionSet}
              />
              <div className="flex justify-center mt-5">
                <button
                  onClick={handleProductionSet}
                  className="cursor-pointer px-6 hover:px-8 py-2 text-xl font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
                >
                  Set Values
                </button>
              </div>
            </>
          )}
          <TraderTable turn={((levelTurnKey - 1) % 10) + 1} />
          {productionExists && !tradeEnded && (
            <>
              <p
                className={`text-white text-2xl font-medium text-center mt-10`}
              >
                Trading Phase
              </p>
              {/*<ResourceDisplay availableResources={availableResources} />*/}
              <Lvl2TradePanel
                tradeSell={tradeSell}
                setTradeSell={setTradeSell}
                levelTurnKey={levelTurnKey}
                setTradeTotals={setTradeTotals}
                tradeTotals={tradeTotals}
              />
              <div className="flex justify-center mt-5">
                <button
                  onClick={calcTradeValues}
                  className="cursor-pointer px-6 hover:px-8 py-2 text-xl font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
                >
                  Confirm this Trade
                </button>
              </div>
              <div className="flex justify-center mt-5 h-0.5 w-full bg-stone-700 rounded-full"></div>

              <div className="flex justify-center mt-5">
                <button
                  onClick={calculateResults}
                  className="cursor-pointer px-6 hover:px-8 py-2 text-xl font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
                >
                  End Trading Phase
                </button>
              </div>
            </>
          )}
          {tradeEnded && (
            <button
              onClick={calculateResults}
              className="cursor-pointer mt-10 px-6 hover:px-8 py-2 text-xl font-semibold rounded-full w-full transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
            >
              View Results
            </button>
          )}
        </>
      </div>

      {/* Sidebar Results */}
      <div className="flex flex-col">
        <Results
          happy={happy}
          content={content}
          sad={sad}
          angry={angry}
          score={score}
          levelTurnKey={levelTurnKey}
          isResultOpen={showResults}
          onClose={() => {
            setShowResults(false);
          }}
        />
      </div>
    </div>
  );
}

export default Level2Turn1;
