import { useEffect, useState } from "react";

type PercentageSelectorProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  balance: number;
};

function PercentageSelector({
  inputValue,
  onInputChange,
  balance,
}: PercentageSelectorProps) {
  const [percentage, setPercentage] = useState(0);
  const [maxValue, setMaxValue] = useState(balance);
  const percentages = [0, 25, 50, 75, 100];

  useEffect(() => {
    if (inputValue) {
      const newPercentage = Math.min(
        Math.max((parseFloat(inputValue) / maxValue) * 100, 0),
        100
      );
      setPercentage(newPercentage);
    }
  }, [inputValue, maxValue]);

  useEffect(() => {
    setMaxValue(balance);
  }, [balance]);

  return (
    <div className="slider-container">
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(e) => {
          const newPercentage = parseInt(e.target.value, 10);
          setPercentage(newPercentage);
          onInputChange(
            Math.floor((newPercentage / 100) * maxValue).toString()
          );
        }}
        className="slider"
      />
      <div className="slider-labels">
        {percentages.map((value) => (
          <button
            className={`slider-button ${
              value === 50 ? "slider-button--center" : ""
            } ${value === 25 ? "slider-button--left" : ""}`}
            key={value}
            onClick={() => {
              setPercentage(value);
              onInputChange(Math.floor((value / 100) * maxValue).toString());
            }}
          >
            <div
              className={`circle ${
                Math.round(percentage) >= Math.round(value)
                  ? "circle--active"
                  : ""
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
