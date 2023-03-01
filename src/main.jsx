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
function FunctionComponentOld() {
  const [number, setNumber] = React.useReducer(reducer, 0);
  //useState 是useReducer的简化
  const [number1, setNumber1] = React.useState(0);
  // useState setNumber1 传入的是老状态就不需要更新
  let attrs = { id: "btn1" };
  // console.log("attrs: ", attrs);
  if (number >= 3) {
    delete attrs.id;
    attrs.style = { color: "red" };
  }
  return (
    <button
      {...attrs}
      onClick={() => {
        // number1 都是2
        // 合并更新
        // setNumber1(number1);
        // setNumber1(number1 + 1);
        // setNumber1(number1 + 2);

        // 3
        setNumber1((n) => n);
        setNumber1((n) => n + 1);
        setNumber1((n) => n + 2);
      }}
    >
      {number1}
    </button>
  );
  return (
    <button
      {...attrs}
      onClick={() => {
        // 组成双向循环链表
        setNumber({ type: "increment" }); // update1=>u2=>u3=>u1
        setNumber({ type: "increment" }); // update2
        setNumber({ type: "increment" }); // update3
      }}
    >
      {number}
    </button>
  );
}
// 相同key 相同类型
function FunctionComponent2() {
  const [number, setNumber] = React.useState(0);
  return number === 0 ? (
    <div onClick={() => setNumber(number + 1)} key='title' id='title'>
      title{number}
    </div>
  ) : (
    <div onClick={() => setNumber(number + 1)} key='title' id='title2'>
      title2 {number}
    </div>
  );
}
// key不同 类型相同
// function FunctionComponent() {
//   const [number, setNumber] = React.useState(0);
//   return number === 0 ? (
//     <div onClick={() => setNumber(number + 1)} key='title1' id='title'>
//       Mytitle
//     </div>
//   ) : (
//     <div onClick={() => setNumber(number + 1)} key='title2' id='title2'>
//       Mytitle2
//     </div>
//   );
// }
// key相同，类型不同
// function FunctionComponent2() {
//   const [number, setNumber] = React.useState(0);
//   return number === 0 ? (
//     <div onClick={() => setNumber(number + 1)} key='title1' id='title1'>
//       title1
//     </div>
//   ) : (
//     <p onClick={() => setNumber(number + 1)} key='title1' id='title1'>
//       title1
//     </p>
//   );
// }
// 原来多节点，现在只有一个节点
function FunctionComponent() {
  const [number, setNumber] = React.useState(0);
  return number === 0 ? (
    <ul key='container' onClick={() => setNumber(number + 1)}>
      <li key='A'>A</li>
      <li key='B' id='B'>
        B
      </li>
      <li key='C'>C</li>
    </ul>
  ) : (
    <ul key='container' onClick={() => setNumber(number + 1)}>
      <li key='B' id='B2'>
        B2
      </li>
    </ul>
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
