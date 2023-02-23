import { createRoot } from "react-dom/client";
// let element = (
//   <h1 id='contain'>
//     hello
//     <span style={{ color: "red" }}>world</span>
//   </h1>
// );
function FunctionComponent() {
  // hooks 就需要更新，就需要事件触发
  return (
    <h1
      id='container'
      onClick={() => {
        console.log("父click冒泡");
      }}
      onClickCapture={() => {
        console.log("父click捕获");
      }}
    >
      hello
      <span
        style={{ color: "red" }}
        onClick={() => {
          console.log("儿子click冒泡");
        }}
        onClickCapture={() => {
          console.log("儿子click捕获");
        }}
      >
        world 点击我
      </span>
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
