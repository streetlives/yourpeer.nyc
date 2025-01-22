"use client";

import Link from "next/link";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

function SignInNavbarLinkWrapper() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  console.log("user", user);
  return user ? (
    <div style={{ display: "inline-block" }}>
      <span className="sm:text-xs">{user.signInDetails?.loginId}</span>{" "}
      <a className="sm:text-xs" onClick={signOut} style={{ cursor: "pointer" }}>
        (Sign Out)
      </a>
    </div>
  ) : (
    <Link href="/login" className="sm:text-xs">
      Sign In
    </Link>
  );
}

export function SignInNavbarLink() {
  return (
    <Authenticator.Provider>
      <SignInNavbarLinkWrapper />
    </Authenticator.Provider>
  );
}
