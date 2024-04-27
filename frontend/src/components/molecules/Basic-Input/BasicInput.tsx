function BasicInput() {
  return (
    <div
      style={{
        marginTop: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <p>Amount</p>
        <div style={{ display: "flex" }}>
          <p
            style={{
              marginRight: "1rem",
              fontSize: ".75rem",
            }}
          >
            Your Wallet Balance:
          </p>
          <p>254651600</p>
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
        }}
      />
    </div>
  );
}

export default BasicInput;
