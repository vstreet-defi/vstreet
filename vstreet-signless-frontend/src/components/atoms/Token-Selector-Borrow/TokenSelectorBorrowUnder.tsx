import { useState, useEffect, useRef } from "react";

function TokenSelector() {
  const [showMessage, setShowMessage] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setShowMessage((prevState) => !prevState);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setShowMessage(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="Token-Selector">
      <p className="TS-Label">Token</p>
      <div className="select-wrapper" onClick={handleClick} ref={wrapperRef}>
        <select disabled>
          <option value="">vUSD</option>
        </select>
        <span className="custom-arrow"></span>
      </div>
      {showMessage && (
        <Tooltip message="At the moment we only allow vUSD borrows." />
      )}
    </div>
  );
}

interface TooltipProps {
  message: string;
}

const Tooltip: React.FC<TooltipProps> = ({ message }) => {
  return (
    <div className="custom-tooltip">
      <p>{message}</p>
    </div>
  );
};

export default TokenSelector;
