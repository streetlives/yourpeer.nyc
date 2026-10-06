---
category: Display
---
Hairline divider (Radix Separator, shadcn/ui), neutral-200, 1px. Horizontal by default; `orientation="vertical"` inside a fixed-height flex row. For list dividers yourpeer more often uses `divide-y divide-dotted divide-neutral-200` on the list itself.

```jsx
<div className="text-sm">
  <p className="font-medium text-dark">Holy Apostles Soup Kitchen</p>
  <Separator className="my-3" />
  <div className="flex h-5 items-center gap-3 text-neutral-500">
    <span>Food</span><Separator orientation="vertical" /><span>Chelsea</span>
  </div>
</div>
```
