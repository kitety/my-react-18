import { createRoot } from "react-dom/client";
let element = (
  <div>
    <h1>
      hello
      <span style={{ color: "red" }}>world</span>
    </h1>
    <h2>
      good
      <span style={{ color: "red" }}>job</span>
    </h2>
  </div>
);
console.log("element: ", element);
// debugger;
const root = createRoot(document.getElementById("root"));
console.log("root: ", root);
// element元素的虚拟dom渲染到容器中
root.render(element);
