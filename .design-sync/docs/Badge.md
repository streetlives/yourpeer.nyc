---
category: Display
---
Small status label (shadcn/ui): `rounded-md`, `text-xs font-semibold`, `px-2.5 py-0.5`. Use for short statuses and counts. Note: yourpeer's own filter chips are not Badges; they're `rounded-full` pills (`bg-primary text-dark text-xs py-1 px-3`) built inline.

```jsx
<div className="flex gap-2">
  <Badge>Verified</Badge>
  <Badge variant="secondary">6 months ago</Badge>
  <Badge variant="destructive">Closed</Badge>
  <Badge variant="outline">Draft</Badge>
</div>
```
