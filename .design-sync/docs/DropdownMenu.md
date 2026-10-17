---
category: Overlays
---
Menu anchored to a trigger (Radix DropdownMenu, shadcn/ui): white panel, 6px radius, neutral-200 border, `text-sm` items with a neutral-100 highlight. yourpeer uses it for the signed-in account menu in the header.

Parts: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`, `DropdownMenuPortal`.

```jsx
<DropdownMenu>
  <DropdownMenuTrigger className="flex items-center gap-2 text-neutral-800">
    <UserBoxIcon /> <span>maria.r</span>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>My account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```
