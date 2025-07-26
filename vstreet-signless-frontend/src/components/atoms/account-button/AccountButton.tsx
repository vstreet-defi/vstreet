import Identicon from "@polkadot/react-identicon";
import { buttonStyles } from "@gear-js/ui";
import { Button, Text } from "@chakra-ui/react";
import "./style.css";
import { useState } from "react";

type Props = {
  address: string;
  name: string | undefined;
  onClick: () => void;
  isActive?: boolean;
  block?: boolean;
};

function AccountButton({ address, name, onClick, isActive, block }: Props) {
  const [hovered, setHovered] = useState(false);
  const handleMouseOver = () => {
    setHovered(true);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  return (
    <Button
      background="linear-gradient(90deg, #00ffc4 -17.32%, #4fff4b 107.82%)"
      borderRadius="30px"
      onClick={onClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      style={{
        background: hovered
          ? "linear-gradient(90deg, #00ffc4 -17.32%, #4fff4b 107.82%)"
          : "linear-gradient(90deg, #00e0b0 -17.32%, #3fd748 107.82%)",
      }}
    >
      <Identicon
        value={address}
        className={buttonStyles.icon}
        style={{ marginRight: "4px" }}
        theme="polkadot"
        size={28}
      />
      <Text color="white">{name}</Text>
    </Button>
  );
}

export { AccountButton };
