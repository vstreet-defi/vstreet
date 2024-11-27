import { useState } from "react";
import { FundsCard } from "../../molecules/cards/FundsCardBorrow";

const TABS = {
  DEPOSIT: "Deposit",
  WITHDRAW: "Withdraw",
};

function FundsManagerBorrow() {
  const [selectedTab, setSelectedTab] = useState(TABS.DEPOSIT);

  const handleSelectTab = (tab: string) => {
    setSelectedTab(tab);
  };

  return (
    <div className="funds-manager">
      <div className="funds-manager__tabs">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => handleSelectTab(tab)}
            className={`funds-manager__select-tab ${
              selectedTab === tab ? "funds-manager__select-tab--active" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <FundsCard
        buttonLabel={
          selectedTab === TABS.DEPOSIT ? TABS.DEPOSIT : TABS.WITHDRAW
        }
      />
    </div>
  );
}

export { FundsManagerBorrow };
