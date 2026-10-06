import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "yourpeer.nyc-nextjs";

export const LanguagePicker = () => (
  <Command className="w-80 rounded-lg border border-neutral-200">
    <CommandInput placeholder="Search languages..." />
    <CommandList>
      <CommandEmpty>No language found.</CommandEmpty>
      <CommandGroup heading="Most common">
        <CommandItem>English</CommandItem>
        <CommandItem>Spanish</CommandItem>
        <CommandItem>Chinese (Mandarin)</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Also spoken">
        <CommandItem>Haitian Creole</CommandItem>
        <CommandItem>Bengali</CommandItem>
        <CommandItem>Russian</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);
