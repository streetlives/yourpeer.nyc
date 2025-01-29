"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useTransition } from "react";
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
import { SubmitHandler, useForm } from "react-hook-form";
import { clsx } from "clsx";
import { toast } from "sonner";
import Image from "next/image";

interface Props {
  locationId: string;
  onComplete: () => void;
  provider: string;
  services: string[];
}

type Inputs = {
  whatCouldBeImproved: string;
  whatWentWell: string;
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
  } = useForm<Inputs>();

  const [isConfirm, setIsConfirm] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setIsConfirm(true);
  };

  const handleConfirm = async () => {
    const data = getValues();
    startTransition(async () => {
      try {
        await postComment({
          locationId,
          content: {
            whatCouldBeImproved: data.whatCouldBeImproved,
            whatServicesDidYouUse: selectedServices,
            whatWentWell: data.whatWentWell,
          },
        });
        setIsSuccess(true);
        setIsConfirm(false);
      } catch (e) {
        // @ts-ignore
        if (e.response?.data?.error) toast.error(e.response.data.error);
        else {
          // @ts-ignore
          toast.error(e.message);
        }
        setIsConfirm(false);
      }
    });
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
              <a href="#" className="link">
                Privacy Policy
              </a>
              <span>&nbsp;and&nbsp;</span>
              <a className="link" href="#">
                Terms of Use.
              </a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending && <Spinner />}
              <span>Okay</span>
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setIsConfirm(false)}>
              Back
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSuccess ? (
        <>
          <div className="p-5 absolute inset-0 bg-white z-40 flex flex-col space-y-5 items-center justify-center">
            <Image
              width={60}
              height={60}
              src="/img/icons/love-it-check.svg"
              className="object-contain"
              alt=""
            />
            <h2 className="text-dark font-bold text-xl sm:text-3xl text-center">
              Thanks you for providing feedback!
            </h2>
            <p className="text-sm text-black/60 text-center">
              Thank you for your feedback! It helps others find the right
              services and supports providers in improving their work.
            </p>
          </div>
          <div className="absolute bottom-0 z-50 w-full inset-x-0 bg-transparent px-5 py-2 flex flex-col gap-2">
            <Button size="lg" className="w-full" onClick={onComplete}>
              Done
            </Button>
          </div>
        </>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white h-full relative overflow-y-hidden pt-2 px-5"
        >
          <div className="pb-12 space-y-6">
            <div className="p-4 rounded-lg bg-indigo-100">
              <h3 className="mb-3 text-base text-[#3D5AFE]">
                A safe space to voice your opinions
              </h3>
              <p className="text-sm">
                Please give us your honest feedback so we can help providers
                improve. Your feedback will be shared anonymously to protect
                your identity.
              </p>
            </div>

            <div>
              <label
                htmlFor="whatService"
                className="mb-2 text-black font-semibold block w-full"
              >
                What service did you use?
              </label>
              <MultiSelect
                options={services.map((s) => ({ value: s, label: s }))}
                onValueChange={setSelectedServices}
                defaultValue={selectedServices}
                placeholder="Choose something"
                variant="inverted"
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
                {...register("whatWentWell", { required: true })}
                rows={5}
                placeholder="What did you like about your experience?"
              ></textarea>
              {errors.whatWentWell && (
                <p className="text-danger text-sm">This field is required</p>
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
                {...register("whatCouldBeImproved")}
                rows={5}
                placeholder="How can they do a better job?"
              ></textarea>
            </div>
          </div>

          <div className=" absolute bottom-0 w-full inset-x-0 bg-transparent px-5 py-2">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!!errors.whatWentWell}
            >
              Submit
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
