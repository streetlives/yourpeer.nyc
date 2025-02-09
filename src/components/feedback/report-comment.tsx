"use client";

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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportComment } from "@/components/streetlives-api-service";
import { Comment } from "@/components/common";
import { toast } from "sonner";
import Spinner from "@/components/spinner";

export default function ReportComment({
  commentId,
  open,
  onComplete,
}: {
  commentId: string;
  open: boolean;
  onComplete: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: reportComment,
    onSuccess: () => {
      queryClient.setQueryData(["comments"], (old: Comment[]) =>
        old.map((c) =>
          c.id === commentId ? { ...c, report_count: c.report_count + 1 } : c,
        ),
      );
      toast.success("Comment reported successfully");
      onComplete();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AlertDialog key={commentId} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report this comment?</AlertDialogTitle>
          <AlertDialogDescription>
            Reporting this comment increases the likelihood that it will be
            reviewed by the moderators. If it is found to violate our
            guidelines, it may be removed or hidden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => mutate(commentId)}
            disabled={isPending}
          >
            {isPending && <Spinner />}
            <span>Report</span>
          </AlertDialogAction>
          <AlertDialogCancel onClick={onComplete}>Back</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
