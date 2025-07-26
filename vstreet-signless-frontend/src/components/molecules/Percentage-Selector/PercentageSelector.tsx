import { useEffect, useState } from "react";

type PercentageSelectorProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  balance: number;
};

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) && !Number.isNaN(num) ? num : fallback;
}

function PercentageSelector({
  inputValue,
  onInputChange,
  balance,
}: PercentageSelectorProps) {
  const [percentage, setPercentage] = useState(0);
  // Siempre asegura que balance sea numérico válido:
  const maxValue = safeNumber(balance);

  const percentages = [0, 25, 50, 75, 100];

  useEffect(() => {
    // inputValue podría no ser parseable, defender:
    const inputValNum = safeNumber(inputValue, 0);
    let newPercentage = 0;
    if (maxValue > 0) {
      newPercentage = Math.min(Math.max((inputValNum / maxValue) * 100, 0), 100);
    }
    setPercentage(newPercentage);
  }, [inputValue, maxValue]);

  return (
    <div className="slider-container">
      <input
        type="range"
        min="0"
        max="100"
        // value nunca debe ser NaN
        value={safeNumber(percentage, 0)}
        onChange={(e) => {
          const newPercentage = safeNumber(e.target.value, 0);
          setPercentage(newPercentage);
          // Evita NaN para maxValue
          const calcValue = Math.floor((newPercentage / 100) * maxValue);
          onInputChange(isFinite(calcValue) ? calcValue.toString() : "0");
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
              const calcValue = Math.floor((value / 100) * maxValue);
              onInputChange(isFinite(calcValue) ? calcValue.toString() : "0");
            }}
            type="button"
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
