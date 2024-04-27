import React, { useState } from "react";

function PercentageSelector() {
  const [percentage, setPercentage] = useState(0);
  const percentages = [10, 25, 50, 75, 100];

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
      {/* <span>{percentage}%</span> */}
      <div className="slider-labels">
        {percentages.map((value) => (
          <button key={value} onClick={() => setPercentage(value)}>
            <div
              className="circles"
              style={{
                backgroundColor: percentage >= value ? "#00FFC4" : "#5D5D5D",
                borderRadius: "100%",
                width: "2rem",
                height: "2rem",
              }}
            ></div>
            {value}%
          </button>
        ))}
      </div>
    </div>
  );
}
export default PercentageSelector;
