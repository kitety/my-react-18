import { setValueForStyles } from "./CSSPropertyOperations";
import { setValueForProperty } from "./DOMPropertyOperations";
import setTextContent from "./setTextContent";

const STYLE = 'style'
const CHILDREN = 'children'

function setInitialDOMProperties(tag, domElement, props) {
  for (const propKey in props) {
    if (Object.hasOwnProperty.call(props, propKey)) {
      const nextProp = props[propKey];
      if (propKey === STYLE) {
        setValueForStyles(domElement, nextProp)
      } else if (propKey === CHILDREN) {
        // 儿子单独处理的
        // 这里处理独生子
        if (typeof nextProp === 'string' || typeof nextProp === 'number') {
          setTextContent(domElement, `${nextProp}`)
        }
      } else if (nextProp !== null) {
        setValueForProperty(domElement, propKey, nextProp)
      }
    }
  }
}

export function setInitialProperties(domElement, tag, props) {
  setInitialDOMProperties(tag, domElement, props)
}
// 重点是找到差异
export function diffProperties(domElement, tag, lastProps, nextProps) {
  let updatePayload = null
  let propKey;
  let styleName;
  // 有的话会转换为对象
  let styleUpdates = null;
  // 处理属性的删除
  // 如果一个熟悉在老对象里有，新对象里没有，那就要删除
  for (propKey in lastProps) {
    // 新属性里面有此属性 或者老属性里面没有 或者老属性里面的值是null
    // 就不用管
    if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
      continue;
    }
    // 特殊处理 nextProps里面没有的
    // 样式
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {}
          }
          styleUpdates[styleName] = ''
        }
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, null)
    }
  }
  // 更新和添加 //遍历新的属性对象
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];// 新属性中的值
    const lastProp = lastProps !== null ? lastProps[propKey] : undefined//老属性的值
    // 新的里面没有 值是一样的 或者属性值都是null
    if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || (nextProp === null && lastProp === null)) {
      // 继续
      continue
    }
    // 样式
    if (propKey === STYLE) {
      if (lastProp) {
        // 老的有
        // 计算要删除的行内样式
        for (styleName in lastProp) {
          // 老的有 新的没有 就删除掉
          if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = ''
          }
        }
        // 遍历新的样式对象
        for (styleName in nextProp) {
          // 新的值和旧的值不一样
          if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = nextProp[styleName]
          }
        }
      } else {
        // 老的没有就直接更新这些
        styleUpdates = nextProp;
      }
    } else if (propKey === CHILDREN) {
      // 儿子单独处理
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        (updatePayload = updatePayload || []).push(propKey, nextProp)
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp)
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }

  return updatePayload;//[key1,value1,key2,value2]
}
export function updateProperties(domElement, updatePayload) {
  updateDOMProperties(domElement, updatePayload)
}
function updateDOMProperties(domElement, updatePayload) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue)
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, `${propValue}`)
    } else {
      setValueForProperty(domElement, propKey, propValue)
    }

  }
}
