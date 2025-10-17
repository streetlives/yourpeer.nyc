import { Page } from '@playwright/test';

export async function simulateGoogleTranslate(page: Page) {
  await page.addInitScript(() => {
    // Walk and replace text nodes with <font class="gt-sim"> wrappers
    function wrapTextNodes(root: Node) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const toWrap: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const t = n as Text;
        const txt = t.nodeValue?.trim();
        if (!txt) continue; // skip empty/whitespace only
        toWrap.push(t);
      }
      for (const t of toWrap) {
        const font = document.createElement('font');
        font.className = 'gt-sim';
        font.textContent = t.nodeValue || '';
        t.parentNode?.replaceChild(font, t);
      }
    }
    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => wrapTextNodes(document.body));
    } else {
      wrapTextNodes(document.body);
    }
  });
}
