import { useState } from "react";
import { CardDeposit } from "../../molecules/cards/CardDeposit";
import { CardWithdraw } from "../../molecules/cards/CardWithdraw";

function LiquidityInjection() {
  const [selectedTab, setSelectedTab] = useState("Deposit");
  const [DepositIsActive, setDepositIsActive] = useState(true);

  const handleSelectDepositClick = () => {
    console.log("Deposit Tab");
    setSelectedTab("Deposit");
    setDepositIsActive(!DepositIsActive);
  };
  const handleSelectWithdrawClick = () => {
    console.log("Withdraw Tab");
    setSelectedTab("Withdraw");
    setDepositIsActive(!DepositIsActive);
  };
  return (
    <div className="liquidity-injection__content">
      <div
        style={{
          position: "relative",
          width: "100%",
          top: "4rem",
        }}
      >
        {" "}
        <button
          onClick={handleSelectDepositClick}
          className={`SelectDeposit ${DepositIsActive ? "" : "in-active"}`}
        >
          Deposit
        </button>
        <button
          onClick={handleSelectWithdrawClick}
          className={`SelectWithdraw ${DepositIsActive ? "in-active" : ""}`}
        >
          Withdraw
        </button>
        {selectedTab === "Deposit" ? (
          <div className="Deposit">
            <CardDeposit />
          </div>
        ) : (
          <div className="Withdraw">
            <CardWithdraw />
          </div>
        )}
      </div>
    </div>
  );
}

export { LiquidityInjection };
