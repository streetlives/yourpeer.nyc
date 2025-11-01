import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import {
  getCurrentUser,
  signIn,
  SignInInput,
  SignInOutput,
} from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

Amplify.configure(outputs);

export function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
        router.replace("/");
      } catch (err) {
        //
      }
    };

    checkUser();
  }, []);

  return (
    <div className="relative py-10 min-h-40">
      <div className="absolute h-28 text-center flex items-center justify-center  text-black w-full inset-x-0">
        <p className="text-center animate-pulse">Redirecting...</p>
      </div>
      <div className="bg-white z-20 relative mt-12">
        <Authenticator
          services={{
            handleSignIn: async (input: SignInInput): Promise<SignInOutput> => {
              const result = await signIn(input);
              return result;
            },
          }}
          hideSignUp
        >
          <AuthRedirect />
        </Authenticator>
      </div>
    </div>
  );
}

function AuthRedirect() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/");
    }
  }, [authStatus, router]);

  return null;
}
