import "./FaucetCard.scss";
function FaucetCard() {
  const handleClick = () => {};
  return (
    <>
      <div className={"faucetbanner"}>
        <p className="faucetbannertext">
          Mint here your $vUSD to test the dapp
        </p>
      </div>
      <div className={"faucetbody"}>
        <button className={"btn-grad-fill-faucet"} onClick={handleClick}>
          <p>Mint 1000 vUSD</p>
        </button>
      </div>
    </>
  );
}
export { FaucetCard };
