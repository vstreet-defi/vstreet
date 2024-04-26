function TokenSelector() {
  return (
    <div className="Token-Selector">
      <p>Token</p>
      <select>
        <option value="">USDC</option>
        <option value="token1">VARA</option>
        <option value="token2">VSTR</option>
        <option value="token3">gVARA</option>
      </select>
    </div>
  );
}

export default TokenSelector;
