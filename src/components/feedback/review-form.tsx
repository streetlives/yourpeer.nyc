"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
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
import Spinner from "@/components/spinner";
import { postComment } from "@/components/streetlives-api-service";
import { MultiSelect } from "@/components/ui/multi-select";
import { Controller, useForm } from "react-hook-form";
import { clsx } from "clsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EmailSubmit from "@/components/feedback/email-submit";
import {
  GoogleReCaptcha,
  GoogleReCaptchaProvider,
} from "react-google-recaptcha-v3";
import { useAuthenticator } from "@aws-amplify/ui-react";

const NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY;

interface Props {
  locationId: string;
  onComplete: () => void;
  provider: string;
  services: string[];
}

type Inputs = {
  whatCouldBeImproved: string;
  whatWentWell: string;
  whatServicesDidYouUse: string[];
};

export default function ReviewForm({
  locationId,
  provider,
  onComplete,
  services,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    control,
  } = useForm<Inputs>();

  const [isConfirm, setIsConfirm] = useState(false);
  const [commentId, setCommentId] = useState<null | string>(null);
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>();
  const { user } = useAuthenticator((context) => [context.user]);

  const { mutate, isPending } = useMutation({
    mutationFn: (content: Inputs) =>
      postComment({
        locationId,
        content,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setIsConfirm(false);
      setCommentId(data.id);
    },
  });

  const containsURL = (value: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return !urlRegex.test(value) || "Text should not contain URLs";
  };

  return (
    <>
      <AlertDialog open={isConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Giving everyone a safe space to voice their opinions
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span>
                Your feedback will be shared with providers without revealing
                your identity, unless you choose to share your email address on
                the next screen. You may also request to delete your feedback
                later. To learn more about your rights, see our&nbsp;
              </span>
              <a href="/privacy-policy" className="link" target="_blank">
                Privacy Policy
              </a>
              <span>&nbsp;and&nbsp;</span>
              <a className="link" href="/terms-of-use" target="_blank">
                Terms of Use.
              </a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => mutate(getValues())}
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

      {commentId !== null ? (
        <EmailSubmit
          onComplete={onComplete}
          provider={provider}
          commentId={commentId}
        />
      ) : (
        <form
          onSubmit={handleSubmit(() => {
            if (token) {
              setIsConfirm(true);
            }
          })}
          className="bg-white h-full relative overflow-y-hidden pt-2 px-5"
        >
          <div className="pb-12 space-y-6">
            <div className="p-4 rounded-lg bg-indigo-100">
              <h3 className="mb-3 text-base text-[#3D5AFE]">
                A safe space to voice your opinions
              </h3>
              <p className="text-sm">
                <span>
                  Please give us your honest feedback so we can help providers
                  improve. Your feedback may be reviewed. For more information,
                  see our&nbsp;
                </span>
                <a
                  target="_blank"
                  className="link"
                  href="https://docs.google.com/document/d/e/2PACX-1vTi6AR2Q-PpTNMLTimvdVg8yDuLJ5DURswQ-heCToXj3OwuqNXyt-LIBs-By9znC2A_0HxqlO8vQ_DJ/pub"
                >
                  feedback guidelines
                </a>
              </p>
            </div>

            <div>
              <label
                htmlFor="whatService"
                className="mb-2 text-black font-semibold block w-full"
              >
                What service did you use?
              </label>
              <Controller
                control={control}
                name="whatServicesDidYouUse"
                render={({ field: { onChange } }) => (
                  <MultiSelect
                    options={services.map((s) => ({ value: s, label: s }))}
                    onValueChange={onChange}
                    placeholder="Choose something"
                    variant="inverted"
                  />
                )}
              />
            </div>

            <div>
              <label
                htmlFor="whatWentWell"
                className="mb-2 text-black font-semibold block w-full"
              >
                What went well?
              </label>

              <textarea
                className={clsx(
                  "text-black text-sm placeholder:text-gray-500 rounded-md w-full resize-none",
                  errors.whatWentWell
                    ? "!border-danger focus:!ring-danger"
                    : "border-gray-400",
                )}
                {...register("whatWentWell", {
                  required: "This field is required",
                  validate: user ? undefined : containsURL,
                })}
                rows={5}
                placeholder="What did you like about your experience?"
              ></textarea>
              {errors.whatWentWell && (
                <p className="text-danger text-sm">
                  {errors.whatWentWell.message}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="whatWentWell"
                className="mb-2 text-black font-semibold block w-full"
              >
                What could be improved?
              </label>

              <textarea
                className={clsx(
                  "text-black text-sm placeholder:text-gray-500 rounded-md w-full resize-none",
                  errors.whatCouldBeImproved
                    ? "!border-danger focus:!ring-danger"
                    : "border-gray-400",
                )}
                {...register("whatCouldBeImproved", {
                  validate: user ? undefined : containsURL,
                })}
                rows={5}
                placeholder="How can they do a better job?"
              ></textarea>
              {errors.whatCouldBeImproved && (
                <p className="text-danger text-sm">
                  {errors.whatCouldBeImproved.message}
                </p>
              )}
            </div>

            <GoogleReCaptchaProvider
              reCaptchaKey={NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY || ""}
            >
              <GoogleReCaptcha
                onVerify={(token) => {
                  setToken(token);
                }}
              />
            </GoogleReCaptchaProvider>
          </div>

          <div className=" absolute bottom-0 w-full inset-x-0 bg-transparent px-5 py-2">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!!errors.whatWentWell || !!errors.whatCouldBeImproved}
            >
              Submit
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
