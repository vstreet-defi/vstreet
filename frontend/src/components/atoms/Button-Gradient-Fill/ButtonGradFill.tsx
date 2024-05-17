interface ButtonProps {
  text: string;
}

function ButtonGradFill({ text }: ButtonProps) {
  return <button className="btn-grad-fill">{text}</button>;
}

export default ButtonGradFill;
