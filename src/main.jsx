import { createRoot } from "react-dom/client";
let element = (
  <h1 id='contain'>
    hello
    <span style={{ color: "red" }}>world</span>
  </h1>
);
console.log("element: ", element);
// debugger;
const root = createRoot(document.getElementById("root"));
console.log("root: ", root);
// element元素的虚拟dom渲染到容器中
root.render(element);
