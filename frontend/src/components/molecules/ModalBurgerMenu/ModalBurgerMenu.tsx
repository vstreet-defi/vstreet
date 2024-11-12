import Flag from "components/atoms/Flag";
import { DappTab } from "components/templates/Header/Header";
import { useLocation } from "react-router-dom";

const ModalBurgerMenu = ({ isOpen, items, selectedTab }: any) => {
  const location = useLocation();
  const isDapp = location.pathname !== "/";
  const handleClick = (item: string): void => {
    if (item === "Home") {
      window.location.href = "/";
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
  };
  const renderFlag = (item: string) => {
    if (item !== DappTab.Home && isDapp) {
      return <Flag text={item === DappTab.Markets ? "Coming Soon" : "New"} />;
    }
    return null;
  };
  return (
    <div className={isOpen ? "menu open" : "menu"}>
      <ul>
        {items.map((item: any, index: any) => (
          <>
            {renderFlag(item)}
            <li key={index}>
              <button
                className={`${
                  item.toLowerCase() === selectedTab && isDapp ? "active" : ""
                }`}
                onClick={() => handleClick(item)}
              >
                {item}
              </button>
            </li>
          </>
        ))}
      </ul>
    </div>
  );
};

export default ModalBurgerMenu;
