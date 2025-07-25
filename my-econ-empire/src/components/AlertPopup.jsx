// AlertPopup.jsx
import React from "react";
import { X } from "lucide-react";

const AlertPopup = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="relative bg-stone-800 text-white py-3 px-5 rounded-2xl shadow-xl max-w-sm w-full">
        <div className="mt-4 text-center">
          <p className="text-lg">{message}</p>
        </div>
        <button
          className={`w-full mt-5 rounded-full bg-white/20 py-2 cursor-pointer`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertPopup;
