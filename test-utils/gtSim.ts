export function simulateTranslateInJSDOM(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const queue: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    const txt = t.nodeValue?.trim();
    if (!txt) continue;
    queue.push(t);
  }
  for (const t of queue) {
    const font = document.createElement('font');
    font.className = 'gt-sim';
    font.textContent = t.nodeValue || '';
    t.parentNode?.replaceChild(font, t);
  }
}
