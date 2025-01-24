"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AddReviewSuccess({
  onComplete,
  provider,
}: {
  onComplete: () => void;
  provider: string;
}) {
  const [email, setEmail] = useState<string>("");
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <>
      <AlertDialog open={isConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>How will your email be used?</AlertDialogTitle>
            <AlertDialogDescription>
              By entering your email and hitting “Okay”, you agree that
              Streetlives will share your email with the provider for you to
              receive updates about your feedback and the provider’s programs.
              For more information, see the provider’s privacy policy.{" "}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsSuccess(true);
                setIsConfirm(false);
              }}
            >
              <span>Okay</span>
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setIsConfirm(false)}>
              Back
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-white h-full relative overflow-y-auto pt-2 px-5">
        <div className="pb-12 mt-10 flex flex-col items-center justify-center">
          <Image
            width={60}
            height={60}
            src={
              isSuccess
                ? "/img/icons/feedback-pilot-group.svg"
                : "/img/icons/love-it-check.svg"
            }
            className="object-contain"
            alt=""
          />

          <div className="mt-5 flex flex-col gap-5">
            {isSuccess ? (
              <>
                <h2 className="text-dark font-bold text-xl sm:text-3xl text-center">
                  We’ve got your email
                </h2>
                <p className="text-sm text-black/60 text-center">
                  {provider} may reach out to you to provide updates about your
                  feedback and their programs. Stay tuned!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-dark font-bold text-xl sm:text-3xl text-center">
                  Thank you for providing feedback!
                </h2>

                <div className="mt-6">
                  <label
                    htmlFor="emailAddress"
                    className="mb-2 text-black font-medium text-center block w-full"
                  >
                    Enter your email to get updates related to your feedback.
                  </label>

                  <input
                    className="text-black text-sm placeholder:text-gray-500 rounded-md border-gray-400 w-full resize-none"
                    name="emailAddress"
                    onChange={(e) => setEmail(e.target.value)}
                    id="emailAddress"
                    placeholder="Email Address"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 w-full inset-x-0 bg-transparent px-5 py-2 flex flex-col gap-2">
          {isSuccess ? (
            <Button size="lg" className="w-full" onClick={onComplete}>
              Done
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setIsConfirm(true)}
                disabled={!email}
              >
                Get updates
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onComplete}
              >
                Skip
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
