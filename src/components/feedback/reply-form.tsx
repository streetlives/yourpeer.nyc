import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import Image from "next/image";
import { postCommentReply } from "@/components/streetlives-api-service";

export default function ReplyForm({
  commentId,
  username,
  onComplete,
}: {
  commentId: string;
  username: string;
  onComplete: () => void;
}) {
  const [content, setContent] = React.useState("");
  const [isPending, startTransition] = useTransition();
  const [replySuccess, setReplySuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        const res = await postCommentReply(commentId, username, content);
        console.log(res);
        setReplySuccess(true);
      } catch (e) {
        onComplete();
        console.log(e);
        alert(e.message);
        if (e.response?.data?.error) {
          alert(e.response.data.error);
        }
      }
    });
  };

  return replySuccess ? (
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
        <Button size="lg" className="w-full" onClick={onComplete}>
          Done
        </Button>
      </div>
    </>
  ) : (
    <form
      action="#"
      className="bg-white mt-2 py-5 px-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <h3 className="text-lg sm:text-lg text-dark font-semibold mb-2">
          Replying as {username}
        </h3>

        <p className="text-sm">
          We encourage you to consider acknowledging the feedback and provide
          guidance if possible
        </p>

        <textarea
          className="text-black text-sm placeholder:text-gray-500 rounded-md border-gray-400 w-full resize-none"
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="..."
        ></textarea>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending && <Spinner />}
            <span>Submit</span>
          </Button>

          <Button
            onClick={onComplete}
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
