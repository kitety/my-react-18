import { createRoot } from "react-dom/client";
let element = (
  <h1>
    hello
    <span style={{ color: "red" }}>world</span>
  </h1>
);
console.log("element: ", element);
// debugger;
const root = createRoot(document.getElementById("root"));
console.log("root: ", root);
root.render(element);
