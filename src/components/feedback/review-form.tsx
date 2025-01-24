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
import AddReviewSuccess from "@/components/feedback/add-review-success";
import { MultiSelect } from "@/components/ui/multi-select";

interface Props {
  locationId: string;
  onComplete: () => void;
  provider: string;
}

export default function ReviewForm({
  locationId,
  onComplete,
  provider,
}: Props) {
  const [isConfirm, setIsConfirm] = useState(false);
  const [content, setContent] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const servicesList = [
    { value: "Food", label: "Food" },
    { value: "Shelter and housing", label: "Shelter and housing" },
    { value: "Personal Care", label: "Personal Care" },
    { value: "Other services", label: "Other services" },
  ];

  const handelSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsConfirm(true);
  };

  const handleConfirm = async () => {
    startTransition(async () => {
      try {
        const res = await postComment({ locationId, content });
        console.log(res);
        setIsSuccess(true);
        setIsConfirm(false);
      } catch (e) {
        console.error(e);
        setIsConfirm(false);
        alert("something went wrong!");
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
        <AddReviewSuccess onComplete={onComplete} provider={provider} />
      ) : (
        <form
          onSubmit={handelSubmit}
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
                options={servicesList}
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
                className="text-black text-sm placeholder:text-gray-500 rounded-md border-gray-400 w-full resize-none"
                name="whatWentWell"
                onChange={(e) => setContent(e.target.value)}
                id="whatWentWell"
                rows={5}
                placeholder="What did you like about your experience?"
              ></textarea>
            </div>

            <div className="mt-6">
              <label
                htmlFor="whatWentWell"
                className="mb-2 text-black font-semibold block w-full"
              >
                What could be improved?
              </label>

              <textarea
                className="text-black text-sm placeholder:text-gray-500 rounded-md border-gray-400 w-full resize-none"
                name="whatCouldBeImproved"
                id=""
                rows={5}
                placeholder="How can they do a better job?"
              ></textarea>
            </div>
          </div>

          <div className=" absolute bottom-0 w-full inset-x-0 bg-transparent px-5 py-2">
            <Button type="submit" size="lg" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
