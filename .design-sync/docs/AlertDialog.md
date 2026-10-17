---
category: Overlays
---
Confirmation dialog (Radix AlertDialog, shadcn/ui) for consequential actions: it has no close (x) and can't be dismissed by clicking outside. `AlertDialogAction` renders a default (black) button; `AlertDialogCancel` an outline button.

Parts: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`, `AlertDialogPortal`, `AlertDialogOverlay`.

```jsx
<AlertDialog>
  <AlertDialogTrigger asChild><Button variant="destructive">Delete service</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete "Soup kitchen"?</AlertDialogTitle>
      <AlertDialogDescription>This permanently removes the service from this location.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep it</AlertDialogCancel>
      <AlertDialogAction className="bg-red-500 hover:bg-red-500/90">Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```
