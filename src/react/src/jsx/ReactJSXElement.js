import hasOwnProperty from "shared/hasOwnProperty";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

// 保留属性，不会放到props上面
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
}
function hasValidKey(config) {
  return config.key !== undefined
}
function hasValidRef(config) {
  return config.ref !== undefined
}
function ReactElement(type, key, ref, props) {
  // react 元素，也就是虚拟dom
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,// 标签 H1 span
    key,// 唯一标识
    ref,// 获取真实dom
    props// 属性 children style id
  }
}
export function jsxDEV(type, config) {
  // 属性名
  let propName;
  // 属性对象
  const props = {};
  // 每个虚拟dom有个可选的key属性，用来区分同个父节点的不同子节点
  let key = null;
  // 引用，通过这个获取真实dom的需求
  let ref = null
  if (hasValidKey(config)) {
    key = config.key
  }
  if (hasValidRef(config)) {
    ref = config.ref
  }
  for (propName in config) {
    //  还需要过滤保留熟悉过
    if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
      props[propName] = config[propName];
    }
  }
  return ReactElement(type, key, ref, props)
}
