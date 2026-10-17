---
category: Display
---
Renders an English UI string through yourpeer's Google Translate integration; with English selected it renders the text as-is. yourpeer wraps every user-visible string in it. It renders a `<span>`, so put typography classes on the parent or pass `className`. Needs `<YourPeerProvider>`.

```jsx
<h2 className="text-xl font-medium text-dark">
  <TranslatableText text="Find free services near you" />
</h2>
```
