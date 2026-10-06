---
category: Loading
---
Pulsing placeholder block (shadcn/ui): `animate-pulse rounded-md bg-neutral-900/10`. Size and shape it with utilities to mirror the content that's loading. yourpeer prefers skeletons over spinners for content.

```jsx
<div className="space-y-3 p-4">
  <Skeleton className="h-7 w-3/4 rounded-full" />
  <Skeleton className="h-4 w-1/2 rounded-full" />
  <Skeleton className="h-44 w-full rounded-xl" />
</div>
```
