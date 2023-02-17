
export function shouldSetTextContent(type, props) {
  // 字符串或数字
  return (
    typeof props.children === 'string' ||
    typeof props.children === 'number'
  );
}
