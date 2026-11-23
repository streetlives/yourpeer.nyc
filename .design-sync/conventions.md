# YourPeer NYC — how to build with this design system

yourpeer.nyc is a calm, mostly monochrome UI: white surfaces, near-black text (`text-dark`), Inter, 8px corners, and **one warm yellow** for brand chrome and selected states. Components are shadcn/ui on Radix plus yourpeer brand pieces; all styling is **Tailwind utility classes**.

## Setup: always wrap in `YourPeerProvider`

```jsx
const { YourPeerProvider, Button } = window.YourPeer;
<YourPeerProvider>{/* your screen */}</YourPeerProvider>
```

`YourPeerProvider` supplies the translation context. `TranslatableText`, `QuickExit`, `Footer` and `ExploreServicesButton` throw without it. It also sets the base `font-sans text-dark` on its wrapper.

## Styling: Tailwind classes from the shipped stylesheet only

`styles.css` is a **pre-compiled** Tailwind build. A class works only if it is in `_ds_bundle.css`. Arbitrary values like `w-[437px]` and unlisted colors will silently do nothing. Stick to these families:

| Purpose | Classes |
|---|---|
| Brand / selected | `bg-primary` (#FFDC00, selected chips and segments), `bg-amber-300` (#FFD54F, header bar, menus) |
| Text | `text-dark` (#323232, body), `text-black`, `text-neutral-500` (meta), `text-gray-600`/`700`/`800` |
| Status | `text-success` (#3FCD76, "Open now"), `text-danger` (#F56081, warnings and errors), `text-info` (#5A87FF), `text-blue` (#1A73E9, links), `bg-purple` (#3D5AFE, community feedback) |
| Surfaces / lines | `bg-white`, `bg-neutral-50`, `bg-grey-100`, `bg-gray-100`, `border-neutral-200`, `border-gray-300`, `divide-y divide-dotted divide-neutral-200` |
| Type | `text-xs` (legends, meta), `text-sm` (body, buttons), `text-base`, `text-lg`, `text-xl` (titles), `font-medium`, `font-semibold` (labels) |
| Spacing | `p-`/`px-`/`py-`/`m-`/`gap-`/`space-y-` with 0-6, 8, 10, 12. Panel gutter is `px-5`; list rows `p-6` or `py-5` |
| Shape | `rounded-lg` (buttons, cards), `rounded-full` (chips, pills), `rounded-md` (inputs), `shadow-sm`, `shadow-service` |
| Layout | `flex`, `grid grid-cols-2/3`, `items-center`, `justify-between`, `w-full`, `max-w-5xl mx-auto` |

Ready-made class buttons for plain `<a>`/`<button>`: `primary-button` (black), `outline-button`, `secondary-button` (small pill), `link`.

**Color rules.** Actions are **black** (`Button` default, `primary-button`). Yellow means *selected* or *brand*, never an action. Pair every status color with a word or icon, never color alone.

## Patterns the library does not include

There is no Input, Select, Checkbox or Table component. Use native elements: `@tailwindcss/forms` styles them. Use `className="rounded-md border-gray-400 text-sm w-full"`, a label `className="mb-2 text-black font-semibold block text-sm"`, and errors `className="text-danger text-sm"`. For segmented choices, copy the yourpeer pattern: a row of `<label>`s with `flex-1 border py-2 px-5 text-xs text-center first:rounded-l-lg last:rounded-r-lg`, with the selected one `bg-primary border-black`.

## Where the truth lives

- `styles.css` → `_ds_bundle.css`: every available class.
- `components/<group>/<Name>/<Name>.prompt.md`: usage and subparts. Read these before using compound components (`Dialog*`, `AlertDialog*`, `DropdownMenu*`, `Popover*`, `Command*`).

## Example

```jsx
const { YourPeerProvider, Button, Badge, Separator } = window.YourPeer;

<YourPeerProvider>
  <div className="max-w-md bg-white border border-neutral-200 rounded-lg">
    <div className="p-5 space-y-1">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-dark">Holy Apostles Soup Kitchen</h2>
        <Badge variant="secondary">Updated today</Badge>
      </div>
      <p className="text-xs text-neutral-500">296 9th Ave, New York, NY 10001</p>
      <p className="text-sm text-success">Open now</p>
    </div>
    <Separator />
    <div className="flex gap-2 p-5">
      <Button className="flex-1">Save changes</Button>
      <Button variant="outline" className="flex-1">Cancel</Button>
    </div>
  </div>
</YourPeerProvider>
```
