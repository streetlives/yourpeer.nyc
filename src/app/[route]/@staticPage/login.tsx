import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { signIn, SignInInput, SignInOutput } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

Amplify.configure(outputs);

export function LoginPage() {
  const router = useRouter();
  return (
    <div style={{ paddingTop: "5em", paddingBottom: "1em" }}>
      <Authenticator
        services={{
          handleSignIn: async (input: SignInInput): Promise<SignInOutput> => {
            const result = await signIn(input);
            if (result.isSignedIn) {
              // TODO: redirect to wherever we were before we clicked the login button
              router.push("/");
            }
            return result;
          },
        }}
        hideSignUp
      />
    </div>
  );
}
