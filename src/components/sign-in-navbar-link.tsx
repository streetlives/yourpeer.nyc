"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { UserCircle } from "lucide-react";
import QuickExit from "@/components/quick-exit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

Amplify.configure(outputs);

function SignInNavbarLinkWrapper() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-2 items-center text-neutral-800">
        <span className="max-w-14 truncate">{user.username}</span>
        <UserCircle className="w-5 h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.signInDetails?.loginId}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <QuickExit />
  );
}

export function SignInNavbarLink() {
  return (
    <Authenticator.Provider>
      <SignInNavbarLinkWrapper />
    </Authenticator.Provider>
  );
}
