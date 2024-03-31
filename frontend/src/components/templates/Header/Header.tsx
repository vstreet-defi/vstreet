import { useNavigate } from "react-router-dom";
import Account from "../../molecules/Account/Account";
import Logo from "../../../assets/images/vara street logoNAVCOLOR.svg";

type Props = {
  isAccountVisible: boolean;
};

function Header({ isAccountVisible }: Props) {
  const navigate = useNavigate();
  return (
    <header className="header">
      <img
        className="image-container"
        src={Logo}
        alt="Logo"
        onClick={() => navigate("/")}
      />
      {isAccountVisible && <Account />}
    </header>
  );
}

export default Header;
