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
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
      <h1>Hello, {name}!</h1>
      <p>This is a React component that is rendered on the server and client using the prop "<code>{name}</code>".</p>
      <div>{children}</div>

      <p>Dynamic client-side code:</p>
      <p>Count: {count}</p>
    </div>
  );
}
