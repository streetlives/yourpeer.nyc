---
category: Loading
---
Full-panel skeleton for a location detail page: a 56px header row (back icon + title), title and meta lines, a 176px image block, text lines and a button bar. Its root is `fixed inset-0` (`md:absolute`) and `z-50`, so it covers its panel; put it inside a `relative` container.

```jsx
<div className="relative h-[560px] w-full max-w-md overflow-hidden border border-neutral-200">
  <LocationDetailLoadingSkeleton className="!absolute" />
</div>
```
