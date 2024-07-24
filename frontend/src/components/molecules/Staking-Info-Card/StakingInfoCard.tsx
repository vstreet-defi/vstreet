import { ButtonGradientBorder } from "components/atoms/Button-Gradient-Border/Button-Gradient-Border";

function StakingInfoCard() {
  return (
    <div>
      <div className="BasicCard">
        <div className="Flex">
          <p>Total Deposited</p> <p>45</p>
        </div>

        <div className="Flex">
          <p>Total Earned</p> <p>5</p>
        </div>
        <div className="Flex">
          <p>APR</p> <p>%5</p>
        </div>
        <div className="ButtonFlex">
          <ButtonGradientBorder text="Claim" />
        </div>
      </div>
    </div>
  );
}

export default StakingInfoCard;
