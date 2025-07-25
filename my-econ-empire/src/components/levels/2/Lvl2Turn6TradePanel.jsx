import React, { useEffect, useState } from "react";
import meatIcon from "../../../assets/icons/meat.png";
import berryIcon from "../../../assets/icons/berries.png";
import beerIcon from "../../../assets/icons/beer.png";
import saltIcon from "../../../assets/icons/salt.png";
import riceIcon from "../../../assets/icons/rice.png";
import timberIcon from "../../../assets/icons/timber.png";
import Switch from "../../Switch.jsx";
import Timber from "../../Timber.jsx";
import Coins from "../../Coins.jsx";
import { LVL_2_TRADER_PRICES } from "../../../Constants.jsx";
import Rice from "../../Rice.jsx";
import Meat from "../../Meat.jsx";
import Beer from "../../Beer.jsx";
import Berries from "../../Berries.jsx";
import Salt from "../../Salt.jsx";

const Lvl2Turn6TradePanel = ({
  tradeSell,
  setTradeSell,
  levelTurnKey,
  setTradeTotals,
  tradeTotals,
}) => {
  const [tradeValues, setTradeValues] = useState({
    meat: 0,
    berries: 0,
    timber: 0,
    rice: 0,
    beer: 0,
    salt: 0,
  });

  const handleValueChange = (type, newValue) => {
    newValue = parseInt(newValue, 10);
    setTradeValues((prev) => ({
      ...prev,
      [type]: newValue,
    }));
  };

  const resources = ["meat", "berries", "timber", "rice", "beer", "salt"];

  useEffect(() => {
    const newTotals = resources.reduce(
      (acc, resource) => {
        const value = tradeValues[resource];
        const isSelling = tradeSell[resource];
        const prices =
          LVL_2_TRADER_PRICES[((levelTurnKey - 1) % 10) + 1][
            resource.toUpperCase()
          ];

        if (isSelling) {
          acc[resource] -= value;
          acc.gold += value * prices.SELL;
        } else {
          acc[resource] += value;
          acc.gold -= value * prices.BUY;
        }
        return acc;
      },
      {
        meat: 0,
        berries: 0,
        timber: 0,
        rice: 0,
        beer: 0,
        salt: 0,
        gold: 0,
      },
    );

    if (JSON.stringify(newTotals) !== JSON.stringify(tradeTotals)) {
      setTradeTotals(newTotals);
    }
  }, [tradeValues, tradeSell, levelTurnKey, tradeTotals]);

  return (
    <div className="bg-stone-900 px-4 py-3 rounded-2xl border border-stone-700 font-medium mt-5">
      <div className="flex justify-end items-center gap-x-4 mb-4">
        {tradeTotals.meat !== 0 && <Meat meat={tradeTotals.meat} />}
        {tradeTotals.berries !== 0 && <Berries berries={tradeTotals.berries} />}
        {tradeTotals.timber !== 0 && <Timber timber={tradeTotals.timber} />}
        {tradeTotals.rice !== 0 && <Rice rice={tradeTotals.rice} />}
        {tradeTotals.beer !== 0 && <Beer beer={tradeTotals.beer} />}
        {tradeTotals.salt !== 0 && <Salt salt={tradeTotals.salt} />}
        {tradeTotals.gold !== 0 && <Coins coin={tradeTotals.gold} />}
      </div>

      {[
        {
          icon: meatIcon,
          label: "Meat",
          value: tradeValues.meat,
          setTradeSell: setTradeSell.meat,
          tradeSell: tradeSell.meat,
          max: 200,
          setValue: (v) => handleValueChange("meat", v),
        },
        {
          icon: berryIcon,
          label: "Berries",
          value: tradeValues.berries,
          setTradeSell: setTradeSell.berries,
          tradeSell: tradeSell.berries,
          max: 200,
          setValue: (v) => handleValueChange("berries", v),
        },
        {
          icon: timberIcon,
          label: "Timber",
          value: tradeValues.timber,
          setTradeSell: setTradeSell.timber,
          tradeSell: tradeSell.timber,
          max: 200,
          setValue: (v) => handleValueChange("timber", v),
        },
        {
          icon: riceIcon,
          label: "Rice",
          value: tradeValues.rice,
          setTradeSell: setTradeSell.rice,
          tradeSell: tradeSell.rice,
          max: 200,
          setValue: (v) => handleValueChange("rice", v),
        },
        {
          icon: beerIcon,
          label: "Beer",
          value: tradeValues.beer,
          setTradeSell: setTradeSell.beer,
          tradeSell: tradeSell.beer,
          max: 200,
          setValue: (v) => handleValueChange("beer", v),
        },
        {
          icon: saltIcon,
          label: "Salt",
          value: tradeValues.salt,
          setTradeSell: setTradeSell.salt,
          tradeSell: tradeSell.salt,
          max: 200,
          setValue: (v) => handleValueChange("salt", v),
        },
      ].map(
        ({ icon, label, value, setTradeSell, tradeSell, max, setValue }) => (
          <div
            key={label}
            className="grid grid-cols-1 md:grid-cols-[1fr_4fr_2fr_2fr] text-stone-50 gap-6 md:gap-10 items-center text-lg mt-2 bg-stone-800 rounded-2xl border border-stone-700 px-10 py-3"
          >
            <div className={`flex flex-col mb-2 md:mb-0 items-center`}>
              <img width={50} src={icon} alt={label} />
              <span>{label}</span>
            </div>
            <div className="flex items-center justify-center gap-x-2">
              <button
                onClick={() => setValue(Math.max(0, value - 10))}
                className="cursor-pointer px-2 py-1 bg-stone-500 rounded-lg hover:bg-stone-600"
              >
                -10
              </button>
              <button
                onClick={() => setValue(Math.max(0, value - 1))}
                className="cursor-pointer px-2 py-1 bg-stone-500 rounded-lg hover:bg-stone-600"
              >
                -1
              </button>

              <input
                inputMode="numeric"
                value={value}
                max={max}
                min={0}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-20 text-center border rounded-full px-2 py-1 focus:outline-none"
              />

              <button
                onClick={() => setValue(Math.min(max, value + 1))}
                className="cursor-pointer px-2 py-1 bg-stone-500 rounded-lg hover:bg-stone-600"
              >
                +1
              </button>
              <button
                onClick={() => setValue(Math.min(max, value + 10))}
                className="cursor-pointer px-2 py-1 bg-stone-500 rounded-lg hover:bg-stone-600"
              >
                +10
              </button>
            </div>

            <div className="flex items-end justify-center space-x-2 bg-stone-700 text-stone-50 px-3 py-2 rounded-lg text-lg">
              <Switch withTrader={true} setTradeSend={setTradeSell} />
            </div>
            <div className="text-center">
              {tradeSell ? (
                <>
                  <span>{`-${value} ${label}`}</span>
                  <br />
                  <span>
                    +
                    {LVL_2_TRADER_PRICES[((levelTurnKey - 1) % 10) + 1][
                      label.toUpperCase()
                    ].SELL * value}{" "}
                    Gold
                  </span>
                </>
              ) : (
                <>
                  <span>{`+${value} ${label}`}</span>
                  <br />
                  <span>
                    -
                    {LVL_2_TRADER_PRICES[((levelTurnKey - 1) % 10) + 1][
                      label.toUpperCase()
                    ].BUY * value}{" "}
                    Gold
                  </span>
                </>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default Lvl2Turn6TradePanel;
