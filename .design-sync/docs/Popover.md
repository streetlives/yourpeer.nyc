---
category: Overlays
---
Floating panel anchored to a trigger (Radix Popover, shadcn/ui): white, `w-72` by default, 6px radius, neutral-200 border, `p-4`, shadow. Use for small inline editors and pickers; `MultiSelect` is built on it.

Parts: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`.

```jsx
<Popover>
  <PopoverTrigger asChild><Button variant="outline">Filter</Button></PopoverTrigger>
  <PopoverContent align="start" className="space-y-2">
    <p className="text-xs font-semibold text-dark">Opening hours</p>
    <p className="text-sm text-neutral-500">Show only services open now.</p>
  </PopoverContent>
</Popover>
```
