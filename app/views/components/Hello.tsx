import { useState, useEffect } from "react";

type Props = {
  name: string;
  children?: React.ReactNode;
};

export default function Hello({ name, children }: Props) {

  // create an auto inrementing counter to demonstrate interactivity
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <div>{children}</div>
      <p>Count: {count}</p>
    </div>
  );
}
