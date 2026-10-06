---
category: Forms
---
Searchable command list (cmdk, shadcn/ui): a search input over a filterable list of grouped items. Basis of `MultiSelect`; use directly for "pick one from many" (organizations, languages, taxonomy). `CommandDialog` renders it inside a `Dialog`.

Parts: `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup` (`heading`), `CommandItem` (`onSelect`, `value`), `CommandSeparator`, `CommandShortcut`, `CommandDialog`.

```jsx
<Command className="rounded-lg border border-neutral-200">
  <CommandInput placeholder="Search languages..." />
  <CommandList>
    <CommandEmpty>No language found.</CommandEmpty>
    <CommandGroup heading="Common">
      <CommandItem>English</CommandItem>
      <CommandItem>Spanish</CommandItem>
      <CommandItem>Chinese (Mandarin)</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```
