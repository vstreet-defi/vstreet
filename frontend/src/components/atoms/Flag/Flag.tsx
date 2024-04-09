type Props = {
  text: string;
};

function Flag({ text }: Props) {
  return text ? (
    <div className="flag-container">
      <div>
        <p>{text}</p>
      </div>
    </div>
  ) : null;
}

export default Flag;
