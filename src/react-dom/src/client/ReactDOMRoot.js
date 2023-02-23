import { listenToAllSupportedEvents } from 'react-dom-bindings/src/events/DOMPluginsEventSystem';
import { createContainer, updateContainer } from 'react-reconciler/src/ReactFiberReconciler';
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot
}
ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  // 消除多个 清空一遍
  root.containerInfo.innerHTML = ''
  updateContainer(children, root)
}
export function createRoot(container) {
  // container div#root
  const root = createContainer(container);
  // 绑定事件
  listenToAllSupportedEvents(container)
  return new ReactDOMRoot(root);

}
