---
category: Actions
---
The "Quick Exit" safety control that sits at the right end of every yourpeer header, so someone can leave the site instantly. Small black text plus an exit glyph. Keep it visible in any yourpeer-style header; never hide it in a menu. Needs `<YourPeerProvider>` (reads the translation context).

```jsx
<header className="flex items-center justify-between h-16 px-5 bg-amber-300">
  <span className="text-[15px]"><span className="font-extrabold text-black">YourPeer</span>NYC</span>
  <QuickExit />
</header>
```
