import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import Image from "next/image";
import { postCommentReply } from "@/components/streetlives-api-service";
import { SubmitHandler, useForm } from "react-hook-form";
import { clsx } from "clsx";
import { toast } from "sonner";
import { Reply } from "@/components/common";

type Inputs = {
  content: string;
};

export default function ReplyForm({
  commentId,
  username,
  onComplete,
  reply,
}: {
  commentId: string;
  username: string;
  onComplete: (reply: Reply | null) => void;
  reply?: Reply;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const [isPending, startTransition] = useTransition();
  const [replySuccess, setReplySuccess] = React.useState(false);
  const [createdReply, setCreatedReply] = React.useState<Reply | null>(null);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    startTransition(async () => {
      try {
        setCreatedReply(
          await postCommentReply(commentId, username, data.content),
        );
      } catch (e) {
        console.log(e);
        // @ts-ignore
        if (e.response?.data?.error) toast.error(e.response.data.error);
        else {
          // @ts-ignore
          toast.error(e.message);
        }
        onComplete(null);
      }
    });
  };

  return createdReply !== null ? (
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
          Thank you for replying!
        </h2>
        <p className="text-sm text-black/60 text-center">
          Clients love feeling heard by you. Keep up the meaningful work.
        </p>
      </div>
      <div className="absolute bottom-0 z-50 w-full inset-x-0 bg-transparent px-5 py-2 flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full"
          onClick={() => onComplete(createdReply)}
        >
          Done
        </Button>
      </div>
    </>
  ) : (
    <form className="bg-white mt-2 py-5 px-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <h3 className="text-lg sm:text-lg text-dark font-semibold mb-2">
          Replying as {username}
        </h3>

        <div>
          <p className="text-sm mb-4">
            We encourage you to consider acknowledging the feedback and provide
            guidance if possible
          </p>

          <textarea
            className={clsx(
              "text-black text-sm placeholder:text-gray-500 rounded-md w-full resize-none",
              errors.content
                ? "!border-danger focus:!ring-danger"
                : "border-gray-400",
            )}
            defaultValue={reply?.content}
            {...register("content", { required: true })}
            rows={5}
            placeholder="..."
          ></textarea>
          {errors.content && (
            <p className="text-danger text-sm">This field is required</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!!(isPending || errors.content)}
          >
            {isPending && <Spinner />}
            <span>Submit</span>
          </Button>

          <Button
            onClick={() => onComplete(null)}
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
          >
            Back
          </Button>
        </div>
      </div>
    </form>
  );
}
