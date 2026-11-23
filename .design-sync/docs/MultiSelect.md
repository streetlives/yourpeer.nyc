---
category: Forms
---
Multi-value picker: a full-width trigger that lists the selected labels as comma-separated text with a clear (x) button, opening a searchable checklist (Popover + Command) that starts with a "(Select All)" row and ends with "Clear" and "Close" actions at the bottom. Manages its own selection from `defaultValue`; read changes via `onValueChange`. yourpeer uses it on the review form ("Which services did you use?").

```jsx
<MultiSelect
  options={[
    { label: "Food pantry", value: "food-pantry" },
    { label: "Soup kitchen", value: "soup-kitchen" },
    { label: "Clothing", value: "clothing" },
  ]}
  defaultValue={["food-pantry"]}
  onValueChange={(values) => console.log(values)}
  placeholder="Select services"
/>
```
