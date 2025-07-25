import React, { useEffect, useState } from "react";
import Lvl1ProductionPanel from "./Lvl1ProductionPanel.jsx";
import Results from "../../Results.jsx";
import Lvl1TradePanel from "./Lvl1TradePanel.jsx";
import { db } from "../../../firebase.config.js";
import meatIcon from "../../../assets/icons/meat.png";
import berryIcon from "../../../assets/icons/berries.png";
import {
  fetchPartnerId,
  fetchPartnerVillageName,
  useSetTradeValueLvl1,
} from "../../../utils/firebase/Firestore.jsx";
import { doc, onSnapshot } from "firebase/firestore";
import SystemButton from "../../SystemButton.jsx";
import useAuth from "../../../hooks/useAuth.jsx";

function Level1Turn6({
  onResultsOpen,
  score,
  villageLetter,
  regionId,
  levelTurnKey,
}) {
  const { user } = useAuth();
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
  const [meatTradeValueGlobal, setMeatTradeValueGlobal] = useState(0);
  const [berriesTradeValueGlobal, setBerriesTradeValueGlobal] = useState(0);
  const [meatTradeSend, setMeatTradeSend] = useState(false);
  const [berriesTradeSend, setBerriesTradeSend] = useState(false);
  const setTradeValue = useSetTradeValueLvl1();
  const [tradeSubmitted, setTradeSubmitted] = useState(false);
  const [productionValues, setProductionValues] = useState(null);
  const [loadingProductionValues, setLoadingProductionValues] = useState(true);
  const [tradeAndProductionValues, setTradeAndProductionValues] =
    useState(null);
  const partnerVillageMap = {
    A: "B",
    B: "A",
    C: "D",
    D: "C",
  };

  const [tradeValues, setTradeValues] = useState({});
  const [loadingTradeValues, setLoadingTradeValues] = useState(true);

  const partnerVillageLetter = partnerVillageMap[villageLetter];
  const [partnerId, setPartnerId] = useState("");
  const [partnerVillageName, setPartnerVillageName] = useState("");

  const getPartnerId = async () => {
    const partnerId = await fetchPartnerId(partnerVillageLetter, regionId);
    setPartnerId(partnerId);
  };
  const getPartnerVillageName = async () => {
    const partnerVillageNameDB = await fetchPartnerVillageName(partnerId);
    console.log(partnerVillageNameDB);
    setPartnerVillageName(partnerVillageNameDB);
  };

  useEffect(() => {
    getPartnerId();
  }, [partnerVillageLetter]);

  useEffect(() => {
    if (partnerId) {
      getPartnerVillageName();
    }
  }, [partnerId]);

  //Read Partner Trade Values
  useEffect(() => {
    if (!partnerId || !levelTurnKey) return;

    const docRef = doc(db, "users", partnerId, "Levels", String(levelTurnKey));

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTradeValues({
            MeatTradeValue: data.MeatTradeValue ?? 0,
            BerriesTradeValue: data.BerriesTradeValue ?? 0,
          });
          setLoadingTradeValues(false);
        } else {
          setTradeValues(null);
          setLoadingTradeValues(true);
        }
      },
      (error) => {
        console.error("Error listening to trade values:", error);
        setLoadingTradeValues(false);
      },
    );

    return () => unsubscribe();
  }, [db, partnerId, levelTurnKey]);

  //Read User Trade Values
  useEffect(() => {
    if (!levelTurnKey || !user) return;

    const docRef = doc(db, "users", user.uid, "Levels", String(levelTurnKey));

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProductionValues({
            MeatProductionValue: data.MeatProductionValue ?? 0,
            BerriesProductionValue: data.BerriesProductionValue ?? 0,
          });
          setLoadingProductionValues(false);
        } else {
          setProductionValues(null);
          setLoadingProductionValues(true);
        }
      },
      (error) => {
        console.error("Error listening to production values:", error);
        setLoadingProductionValues(false);
      },
    );

    return () => unsubscribe();
  }, [db, user, levelTurnKey]);

  useEffect(() => {
    if (productionValues && tradeValues) {
      setTradeAndProductionValues({
        TotalMeatValue: Math.round(
          productionValues.MeatProductionValue +
            Math.min(0, tradeValues?.MeatTradeValue ?? 0) * -1,
        ),
        TotalBerriesValue: Math.round(
          productionValues.BerriesProductionValue +
            Math.min(0, tradeValues?.BerriesTradeValue ?? 0) * -1,
        ),
      });
    }
  }, [productionValues, tradeValues]);

  const getAngryCount = (totalProductionValue) => {
    return totalProductionValue < totalVillagers
      ? Math.round(totalVillagers - totalProductionValue)
      : 0;
  };

  const getHappyCount = (totalProductionValue) => {
    console.log(
      tradeAndProductionValues.TotalMeatValue,
      tradeAndProductionValues.TotalBerriesValue,
    );
    if (
      Math.max(
        tradeAndProductionValues.TotalMeatValue,
        tradeAndProductionValues.TotalBerriesValue,
      ) >= totalVillagers
    ) {
      return Math.round(
        Math.min(
          Math.min(
            tradeAndProductionValues.TotalMeatValue,
            tradeAndProductionValues.TotalBerriesValue,
          ),
          totalVillagers,
        ),
      );
    } else if (
      Math.max(
        tradeAndProductionValues.TotalMeatValue,
        tradeAndProductionValues.TotalBerriesValue,
      ) < totalVillagers &&
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

  const sendTradeValues = async () => {
    // Cap the send values to the max available production
    const cappedMeatTradeValue = Math.min(
      meatTradeValueGlobal,
      meatProductionValue,
    );
    const cappedBerriesTradeValue = Math.min(
      berriesTradeValueGlobal,
      berriesProductionValue,
    );

    const MeatTradeValueLocal = meatTradeSend
      ? -cappedMeatTradeValue
      : cappedMeatTradeValue;
    const BerriesTradeValueLocal = berriesTradeSend
      ? -cappedBerriesTradeValue
      : cappedBerriesTradeValue;

    const adjustedMeatProduction =
      MeatTradeValueLocal < 0
        ? meatProductionValue + MeatTradeValueLocal
        : meatProductionValue;

    const adjustedBerriesProduction =
      BerriesTradeValueLocal < 0
        ? berriesProductionValue + BerriesTradeValueLocal
        : berriesProductionValue;

    const submitted = await setTradeValue(
      levelTurnKey,
      MeatTradeValueLocal,
      BerriesTradeValueLocal,
      adjustedMeatProduction,
      adjustedBerriesProduction,
    );

    setTradeSubmitted(submitted);
  };

  const calculateResults = () => {
    const totalProductionValue =
      tradeAndProductionValues.TotalMeatValue +
      tradeAndProductionValues.TotalBerriesValue;
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
      <div className="w-full ml-5 mr-2.5 mb-5 max-w-4xl">
        {!productionValues && (
          <>
            <p className={`text-white text-2xl font-medium text-center mt-5`}>
              Production
            </p>
            <Lvl1ProductionPanel
              villageLetter={villageLetter}
              setMeatSliderValue={setMeatSliderValue}
              setBerriesSliderValue={setBerriesSliderValue}
              setMeatProductionValue={setMeatProductionValue}
              setBerriesProductionValue={setBerriesProductionValue}
              setProductionSet={setProductionSet}
              tradeSubmitted={tradeSubmitted}
            />
            {!tradeSubmitted && (
              <div className="flex justify-center mt-5">
                <button
                  onClick={() => setProductionSet(true)}
                  className="cursor-pointer px-6 hover:px-8 py-2 text-xl font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
                >
                  Set Values
                </button>
              </div>
            )}

            {productionSet && (
              <>
                <div className="flex justify-center mt-5 h-0.5 w-full bg-stone-700 rounded-full"></div>
                <p
                  className={`text-white text-2xl font-medium text-center mt-5`}
                >
                  Trade
                </p>
                <Lvl1TradePanel
                  setMeatTradeValueGlobal={setMeatTradeValueGlobal}
                  setBerriesTradeValueGlobal={setBerriesTradeValueGlobal}
                  setMeatTradeSend={setMeatTradeSend}
                  setBerriesTradeSend={setBerriesTradeSend}
                  tradeSubmitted={tradeSubmitted}
                />
                {!tradeSubmitted && (
                  <div className="flex justify-center mt-5">
                    <button
                      onClick={sendTradeValues}
                      className="cursor-pointer px-6 hover:px-8 py-2 text-xl font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tradeSubmitted || productionValues ? (
          loadingTradeValues ? (
            <p className="text-stone-200 mt-5 p-5 border-stone-500 border-dashed border-2 rounded-xl">
              Waiting for {partnerVillageName} to trade...
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 p-6 border-2 border-blue-500 border-dashed rounded-xl bg-blue-500/20 text-white text-center">
              <div className="flex flex-col items-center md:items-center">
                <h2 className="text-xl mb-3 font-semibold">Received</h2>
                <div className="flex gap-x-10 text-lg">
                  <div className="flex flex-col items-center">
                    <img width={50} src={meatIcon} alt="Meat" />
                    <span>{`Meat: ${Math.min(0, tradeValues?.MeatTradeValue ?? 0) * -1}`}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img width={50} src={berryIcon} alt="Berries" />
                    <span>{`Berries: ${Math.min(0, tradeValues?.BerriesTradeValue ?? 0) * -1}`}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-center">
                <div className="md:hidden block bg-blue-500/40 h-0.5 my-4 w-full"></div>
                <h2 className="text-xl mb-3 font-semibold">
                  Total After Trade
                </h2>
                <div className="flex gap-x-10 text-lg">
                  <div className="flex flex-col items-center">
                    <img width={50} src={meatIcon} alt="Meat" />
                    <span>{`Meat: ${Math.round(productionValues.MeatProductionValue)} + ${Math.min(0, tradeValues?.MeatTradeValue ?? 0) * -1} = ${tradeAndProductionValues?.TotalMeatValue}`}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img width={50} src={berryIcon} alt="Berries" />
                    <span>{`Berries: ${Math.round(productionValues.BerriesProductionValue)} + ${Math.min(0, tradeValues?.BerriesTradeValue ?? 0) * -1} = ${tradeAndProductionValues?.TotalBerriesValue}`}</span>
                  </div>
                </div>
                <button
                  onClick={calculateResults}
                  className="bg-blue-500 rounded-full py-2 px-4 cursor-pointer mt-4 font-semibold"
                >
                  View Results
                </button>
              </div>
            </div>
          )
        ) : (
          <div></div>
        )}
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

export default Level1Turn6;
