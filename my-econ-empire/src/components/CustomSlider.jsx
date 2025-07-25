import { useState, useRef, useEffect } from "react";

const CustomSlider = ({ value, onChange, max, disabled = false }) => {
  const [labelPos, setLabelPos] = useState("50%");
  const sliderRef = useRef(null);

  // Update label position dynamically
  useEffect(() => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    const percent = value / Number(max); // Convert value to 0-1 scale
    const sliderWidth = slider.offsetWidth; // Full slider width
    const thumbWidth = 20; // Approximate thumb width in pixels
    const labelWidth = 50; // Approximate label width in pixels

    // Calculate exact label position
    const newPosition =
      percent * (sliderWidth - thumbWidth) + thumbWidth / 2 - labelWidth / 2;
    setLabelPos(`${newPosition}px`);
  }, [value]);

  return (
    <div className="relative w-full max-w-96 flex flex-col items-center">
      {/* Label above the thumb */}
      <div
        className="absolute -top-10 text-stone-50 bg-stone-700 px-4 py-1 rounded-full text-sm"
        style={{ left: labelPos }}
      >
        {value}
      </div>

      {/* Slider */}

      <input
        type="range"
        min="0"
        max={max}
        disabled={disabled}
        value={value}
        onChange={onChange}
        ref={sliderRef}
        className="w-full cursor-pointer appearance-none bg-transparent
        [&::-webkit-slider-runnable-track]:bg-stone-400 [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:rounded-sm

        [&::-moz-range-track]:bg-stone-400 [&::-moz-range-track]:h-4 [&::-moz-range-track]:rounded-sm

        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-6.5 [&::-webkit-slider-thumb]:bg-stone-800
        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-400 [&::-webkit-slider-thumb]:rounded-lg

        [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-stone-800
        [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-stone-400 [&::-moz-range-thumb]:rounded-lg"
      />
    </div>
  );
};

export default CustomSlider;
