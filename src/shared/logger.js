import * as ReactWorkTags from 'react-reconciler/src/ReactWorkTags'

const ReactWorkTagMap = new Map()
for (const tag in ReactWorkTags) {
  if (Object.hasOwnProperty.call(ReactWorkTags, tag)) {
    const element = ReactWorkTags[tag];
    // value - tag
    ReactWorkTagMap.set(element, tag)
  }
}
export default function logger(prefix, workInProgress) {
  let tagValue = workInProgress.tag
  let tagName = ReactWorkTagMap.get(tagValue)
  let str = `${prefix}: ${tagName} `
  if (tagName === 'HostComponent') {
    // 原生节点
    str += ` ${workInProgress.type} `
  } else if (tagName === 'HostText') {
    // 文本
    str += ` ${workInProgress.pendingProps} `
  }
  // console.log(str);
}

let indent = { number: 0 }
export { indent }
