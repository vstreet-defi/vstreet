import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Account from "../../organisms/Account/Account";
import Flag from "../../atoms/Flag/Flag";
import Logo from "../../../assets/images/icons/vStreet-navbar-icon.svg";
import styles from "../../molecules/wallet/Wallet.module.scss";
import BurgerMenu from "components/organisms/BurgerMenu";

type Props = {
  isAccountVisible: boolean;
  items: string[];
  isMobile: boolean;
};

function Header({ isAccountVisible, items, isMobile }: Props) {
  const [activeTab, setActiveTab] = useState<string | null>("borrow");
  const navigate = useNavigate();
  const location = useLocation();
  const isTablet = window.innerWidth < 822;
  const isDapp = location.pathname !== "/";

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    setActiveTab(tab || "borrow");
  }, [location.search]);

  const handleClick = (item: string): void => {
    if (item === "Home") {
      navigate("/");
      setActiveTab(null);
      return;
    }

    if (item === "GitHub") {
      window.open("https://github.com/vstreet-defi/vstreet", "_blank");
    }

    if (item === "Team") {
      window.location.href = "#team";
    }

    if (item === "Contact us") {
      window.location.href = "#social";
    }

    if (isDapp && item !== "Markets") {
      const lowerCaseItem = item.toLowerCase();
      navigate(`/dapp?tab=${lowerCaseItem}`, { replace: true });
      setActiveTab(lowerCaseItem);
    }
  };

  const renderFlag = (item: string) => {
    if (item !== "Home" && isDapp) {
      return <Flag text={item === "Markets" ? "Coming Soon" : "New"} />;
    }
    return null;
  };

  const renderItems = () =>
    items.map((item, index) => (
      <div className="item-wrapper" key={index}>
        {renderFlag(item)}
        <button
          className={`item${
            item.toLowerCase() === activeTab && isDapp && item !== "Markets"
              ? "-active"
              : ""
          }`}
          onClick={() => handleClick(item)}
        >
          <p>{item}</p>
        </button>
      </div>
    ));

  return (
    <header>
      <img src={Logo} alt="Logo" onClick={() => navigate("/")} />
      {isMobile || isTablet ? (
        <BurgerMenu items={items} />
      ) : (
        <>
          <div className="items-container">{renderItems()}</div>
          {isAccountVisible || location.pathname === "/dapp" ? (
            <Account />
          ) : (
            <button
              className={styles.connectWallet}
              type="button"
              onClick={() => navigate("/dapp?tab=borrow")}
              disabled={true}
              style={{ opacity: 0.4, cursor: "not-allowed" }}
            >
              <p>Launch App</p>
            </button>
          )}
        </>
      )}
    </header>
  );
}

export default Header;
