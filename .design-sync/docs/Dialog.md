---
category: Overlays
---
Modal dialog (Radix Dialog, shadcn/ui). Centered white panel, `max-w-lg`, 8px radius, neutral-200 border, dimmed `bg-black/80` overlay, close (x) button top-right built into `DialogContent`.

Parts (all exported from the bundle): `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`, `DialogPortal`, `DialogOverlay`.

```jsx
<Dialog>
  <DialogTrigger asChild><Button variant="outline">Edit hours</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Opening hours</DialogTitle>
      <DialogDescription>When is this service available?</DialogDescription>
    </DialogHeader>
    {/* form fields */}
    <DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Use `AlertDialog` instead when the user must confirm or cancel a consequential action.
