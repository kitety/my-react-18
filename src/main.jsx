import * as React from "react";
console.log("React: ", React);
import { createRoot } from "react-dom/client";
// let element = (
//   <h1 id='contain'>
//     hello
//     <span style={{ color: "red" }}>world</span>
//   </h1>
// );
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    default:
      return state;
  }
}
function FunctionComponent() {
  const [number, setNumber] = React.useReducer(reducer, 0);
  const [number2, setNumber2] = React.useReducer(reducer, 1);
  return (
    <button
      onClick={() => {
        // 双向循环链表
        setNumber({ type: "increment" }); // update1=>u2=>u3=>u1
        setNumber({ type: "increment" }); // update2
        setNumber({ type: "increment" }); // update3
      }}
    >
      {number}
    </button>
  );
}
// function FunctionComponent() {
//   // hooks 就需要更新，就需要事件触发
//   return (
//     <h1 id='container'>
//       hello
//       <span
//         style={{ color: "red" }}
//         onClick={(e) => {
//           console.log("e: ", e);
//           e.stopPropagation();
//           console.log("儿子click冒泡");
//         }}
//         onClickCapture={() => {
//           console.log("儿子click捕获");
//         }}
//       >
//         world 点击我
//       </span>
//     </h1>
//   );
// }
let element = <FunctionComponent />;
// old let element = /*#__PURE__*/React.createElement(FunctionComponent, null);
// new let element = /*#__PURE__*/(0, _jsxRuntime.jsx)(FunctionComponent, {});
console.log("element: ", element);
// debugger;
const root = createRoot(document.getElementById("root"));
console.log("root: ", root);
// element元素的虚拟dom渲染到容器中
root.render(element);
