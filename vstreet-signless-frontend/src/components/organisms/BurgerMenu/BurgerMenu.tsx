import { useEffect, useState, useRef } from "react";
import BurgerIcon from "../../atoms/BurgerIcon/BurgerIcon";
import ModalBurgerMenu from "../../molecules/ModalBurgerMenu/ModalBurgerMenu";

const BurgerMenu = ({ items, selectedTab }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeMenu);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  return (
    <div className="burger-menu" ref={menuRef}>
      <BurgerIcon isOpen={isOpen} toggleMenu={toggleMenu}></BurgerIcon>
      <ModalBurgerMenu
        isOpen={isOpen}
        items={items}
        selectedTab={selectedTab}
      ></ModalBurgerMenu>
    </div>
  );
};

export default BurgerMenu;
