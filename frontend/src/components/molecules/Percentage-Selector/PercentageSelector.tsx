import { useState } from "react";

function PercentageSelector() {
  const [percentage, setPercentage] = useState(0);
  const percentages = [0, 25, 50, 75, 100];

  return (
    <div className="slider-container">
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
        className="slider"
      />
      <div className="slider-labels">
        {percentages.map((value) => (
          <button
            className={`slider-button ${
              value === 50 ? "slider-button--center" : ""
            } ${value === 25 ? "slider-button--left" : ""}`}
            key={value}
            onClick={() => setPercentage(value)}
          >
            <div
              className={`circle ${
                percentage >= value ? "circle--active" : ""
              } ${value === 100 ? "circle--end" : ""} ${
                value === 75 ? "circle--left" : ""
              }`}
            ></div>
            <div
              className={`percentage-label ${
                value === 75 ? "percentage-label--left" : ""
              }`}
            >
              {value}%
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PercentageSelector;
