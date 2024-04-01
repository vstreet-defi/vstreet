import Identicon from "@polkadot/react-identicon";
import { buttonStyles } from "@gear-js/ui";
import { Button, Text } from "@chakra-ui/react";
import "./style.css";

type Props = {
  address: string;
  name: string | undefined;
  onClick: () => void;
  isActive?: boolean;
  block?: boolean;
};

function AccountButton({ address, name, onClick, isActive, block }: Props) {
  return (
    <Button
      border="1px"
      borderColor="white"
      backgroundColor="transparent"
      borderRadius="30px"
      onClick={onClick}
    >
      <Identicon
        value={address}
        className={buttonStyles.icon}
        theme="polkadot"
        size={28}
      />
      <Text color="white">{name}</Text>
    </Button>
  );
}

export { AccountButton };
