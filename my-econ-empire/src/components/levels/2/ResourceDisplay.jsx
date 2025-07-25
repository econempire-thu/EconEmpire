import React from "react";

const ResourceDisplay = ({ availableResources }) => {
  return (
    <div className="bg-stone-900 px-4 py-3 rounded-2xl border border-stone-700 font-medium mt-5">
      <h2 className="text-xl mb-3 text-white">Available Resources</h2>
      <div className="flex gap-x-4">
        {Object.entries(availableResources).map(([resource, amount]) => (
          <li
            key={resource}
            className="flex flex-col justify-evenly w-full pb-1 bg-stone-800 rounded-xl border border-stone-700 text-stone-200 py-1 px-3"
          >
            <span className="uppercase text-sm font-light">{resource}</span>
            <span className={`text-xl`}>{amount}</span>
          </li>
        ))}
      </div>
    </div>
  );
};

export default ResourceDisplay;
