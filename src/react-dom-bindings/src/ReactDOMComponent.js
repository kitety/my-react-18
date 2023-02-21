import { setValueForStyles } from "./CSSPropertyOperations";
import { setValueForProperty } from "./DOMPropertyOperations";
import setTextContent from "./setTextContent";

const STYLE = 'style'
const CHILDREN = 'children'

function setInitialDOMProperties(tag, domElement, props) {
  console.log('tag, domElement, props: ', tag, domElement, props);
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
