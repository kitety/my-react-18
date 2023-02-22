import { createRoot } from "react-dom/client";
// let element = (
//   <h1 id='contain'>
//     hello
//     <span style={{ color: "red" }}>world</span>
//   </h1>
// );
function FunctionComponent() {
  return (
    <h1 id='contain'>
      hello
      <span style={{ color: "red" }}>world</span>
    </h1>
  );
}
let element = <FunctionComponent />;
// old let element = /*#__PURE__*/React.createElement(FunctionComponent, null);
// new let element = /*#__PURE__*/(0, _jsxRuntime.jsx)(FunctionComponent, {});
console.log("element: ", element);
// debugger;
const root = createRoot(document.getElementById("root"));
console.log("root: ", root);
// element元素的虚拟dom渲染到容器中
root.render(element);
