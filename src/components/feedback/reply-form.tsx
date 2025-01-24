import React from "react";
import { Button } from "@/components/ui/button";

export default function ReplyForm({ onCancel }: { onCancel: () => void }) {
  const [content, setContent] = React.useState("");

  return (
    <form action="#" className="bg-white mt-2 py-5 px-4">
      <div className="space-y-4">
        <h3 className="text-lg sm:text-lg text-dark font-semibold mb-2">
          Replying as [Username]
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
          <Button type="submit" size="lg" className="w-full">
            Submit
          </Button>

          <Button
            onClick={onCancel}
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
