---
category: Actions
---
The yourpeer action button (shadcn/ui, `class-variance-authority` variants). Primary actions are **black** (`variant="default"`), never yellow: yellow means "selected", not "do this".

- One `default` button per view for the main action; `outline` or `ghost` for secondary actions; `destructive` only for irreversible deletes.
- Full-width in mobile panels and bottom action bars: add `className="w-full"`.
- Icons go inside as children (Heroicons/Lucide); `[&_svg]:size-4` sizes them automatically.

```jsx
<div className="flex gap-2">
  <Button>Save changes</Button>
  <Button variant="outline">Cancel</Button>
</div>
<Button variant="destructive" size="sm">Delete service</Button>
<Button asChild variant="link"><a href="/about">About YourPeer</a></Button>
```

The site also uses three CSS-class buttons on plain `<a>`/`<button>` elements: `.primary-button` (black, `rounded-lg`, `py-3 px-12`), `.outline-button` (neutral-50 fill, gray border) and `.secondary-button` (small pill, `rounded-3xl`).
