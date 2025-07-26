const BurgerIcon = ({ isOpen, toggleMenu }: any) => {
  return (
    <button className="burger-icon" onClick={toggleMenu}>
      <div className={isOpen ? "line line1 open" : "line line1"}></div>
      <div className={isOpen ? "line line2 open" : "line line2"}></div>
      <div className={isOpen ? "line line3 open" : "line line3"}></div>
    </button>
  );
};

export default BurgerIcon;
