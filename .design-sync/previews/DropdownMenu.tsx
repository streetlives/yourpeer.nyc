import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  UserBoxIcon,
} from "yourpeer.nyc-nextjs";

export const AccountMenu = () => (
  <div className="flex justify-end w-64 p-2">
    <DropdownMenu open modal={false}>
      <DropdownMenuTrigger className="flex gap-2 items-center text-neutral-800 text-sm">
        <UserBoxIcon />
        <span>maria.r</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>My reviews</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
