import React, { useState } from "react";
import Beer from "../../../assets/icons/beer.png";
import Salt from "../../../assets/icons/salt.png";
import Rice from "../../../assets/icons/rice.png";
import Timber from "../../../assets/icons/timber.png";
import Berries from "../../../assets/icons/berries.png";
import Meat from "../../../assets/icons/meat.png";
import { LVL_2_TRADER_PRICES } from "../../../Constants.jsx";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const resourceIcons = {
  BEER: Beer,
  SALT: Salt,
  RICE: Rice,
  TIMBER: Timber,
  BERRIES: Berries,
  MEAT: Meat,
};

const TradeValues = ({ turn }) => {
  const [isOpen, setIsOpen] = useState(true);
  const tradeData = LVL_2_TRADER_PRICES[turn];

  if (!tradeData) return null; // Hide if no trade data

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer absolute flex top-[40%] left-0 px-3 py-2 bg-blue-900/80 text-stone-50 rounded-r-full border-y border-l border-blue-800 hover:bg-blue-800 transition"
        >
          Trade Prices <ChevronRight />
        </button>
      )}

      {/* Trade Table */}
      <div
        className={`z-50 fixed top-[40%] left-0 bg-stone-900 p-4 rounded-r-lg border border-stone-700 text-base w-fit shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <X
          onClick={() => setIsOpen(false)}
          className="cursor-pointer absolute top-3 right-3 text-stone-400 hover:text-stone-50"
        />

        <h2 className="text-xl font-semibold text-stone-50 text-center mb-2">
          Trade Prices
        </h2>
        <table className="w-full border-collapse text-stone-50 text-lg">
          <thead>
            <tr className="bg-stone-800">
              <th className="p-2 border border-stone-700">Resource</th>
              <th className="p-2 border border-stone-700">Sell At</th>
              <th className="p-2 border border-stone-700">Buy At</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tradeData).map(([resource, prices]) => (
              <tr key={resource} className="bg-stone-800">
                <td className="p-2 border border-stone-700 flex items-center gap-2">
                  <img
                    src={resourceIcons[resource]}
                    alt={resource}
                    className="w-8 h-8"
                  />
                  {resource}
                </td>
                <td className="p-2 border border-stone-700 text-emerald-300">
                  {prices.SELL}
                </td>
                <td className="p-2 border border-stone-700 text-red-300">
                  {prices.BUY}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TradeValues;
