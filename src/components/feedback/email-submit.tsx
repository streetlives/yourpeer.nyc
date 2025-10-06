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
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitCommentEmail } from "@/components/streetlives-api-service";
import { clsx } from "clsx";
import Spinner from "@/components/spinner";

type Inputs = {
  email: string;
};

export default function EmailSubmit({
  onComplete,
  provider,
  commentId,
}: {
  onComplete: () => void;
  provider: string;
  commentId: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Inputs>();
  const [isConfirm, setIsConfirm] = useState(false);

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (email: string) => submitCommentEmail(commentId, email),
    onSuccess: () => setIsConfirm(false),
    onError: () => toast.error("Cannot submit email. try again"),
  });

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
              onClick={() => mutate(getValues().email)}
              disabled={isPending}
            >
              {isPending && <Spinner />}
              <span>Okay</span>
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setIsConfirm(false)}>
              Back
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form
        onSubmit={handleSubmit(() => setIsConfirm(true))}
        className="bg-white h-full relative overflow-y-auto pt-2 px-5"
      >
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
                    htmlFor="email"
                    className="mb-2 text-black text-sm text-center block w-full"
                  >
                    Enter your email to get updates related to your feedback. It
                    is OPTIONAL to provide your email. Use the Skip button below
                    if you don't wish to.
                  </label>

                  <input
                    className={clsx(
                      "text-black text-sm placeholder:text-gray-500 rounded-md w-full resize-none",
                      errors.email
                        ? "!border-danger focus:!ring-danger"
                        : "border-gray-400",
                    )}
                    {...register("email", { required: true })}
                    id="email"
                    placeholder="Email Address"
                  />
                  {errors.email && (
                    <p className="text-danger text-sm">
                      This field is required
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 w-full inset-x-0 bg-transparent px-5 py-2 flex flex-col gap-2">
          {isSuccess ? (
            <Button
              size="lg"
              className="w-full"
              type="button"
              onClick={onComplete}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!!errors.email}
              >
                Get updates
              </Button>
              <Button
                variant="outline"
                size="lg"
                type="button"
                className="w-full"
                onClick={onComplete}
              >
                Skip
              </Button>
            </>
          )}
        </div>
      </form>
    </>
  );
}
