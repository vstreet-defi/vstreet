function BasicInput() {
  return (
    <div
      style={{
        marginTop: "1.5rem",
      }}
    >
      <div className="BI-label--container">
        <p className="BI-label">Amount</p>
        <div style={{ display: "flex" }}>
          <p className="BI-label tag">Your Wallet Balance:</p>
          <p className="BI-label number">254651600</p>
        </div>
      </div>

      <input
        className="BasicInput"
        type="number"
        style={{
          backgroundColor: "transparent",
          padding: "10px",
          border: "1px solid #00ffc4",
          fontSize: "16px",
          width: "100%",
          outline: "none",
        }}
      />
    </div>
  );
}

export default BasicInput;
