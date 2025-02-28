import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CommentHighlights, CommentHighlightsItem } from "@/components/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormatedHighlights(
  commentsObj: CommentHighlights,
): string[] {
  const categories = [
    "top_positive_comments",
    "top_negative_comments",
    "top_mixed_comments",
  ];

  function highlightTakeaways(
    comment: string,
    takeaways: string[],
    className: string,
  ): string {
    takeaways.forEach((takeaway) => {
      const regex = new RegExp(`(${takeaway})`, "gi");
      comment = comment.replace(regex, `<span class='${className}'>$1</span>`);
    });
    return comment;
  }

  let selectedComments: string[] = [];
  let availableCategories = categories.filter(
    (category) => commentsObj[category as keyof CommentHighlights].length > 0,
  );

  if (availableCategories.length === 3) {
    // Select one from each category by informativeness score
    availableCategories.forEach((category) => {
      let sortedComments = commentsObj[
        category as keyof CommentHighlights
      ].sort((a, b) => b.informativeness_score - a.informativeness_score);
      let comment = sortedComments[0];
      let highlightedComment = highlightTakeaways(
        comment.comment,
        comment.key_positive_sentiment_takeaways,
        "text-green-700",
      );
      highlightedComment = highlightTakeaways(
        highlightedComment,
        comment.key_negative_sentiment_takeaways,
        "text-danger",
      );
      selectedComments.push(highlightedComment);
    });
  } else {
    // Gather all comments, sort by informativeness, and take top 3
    let allComments: CommentHighlightsItem[] = [];
    availableCategories.forEach((category) => {
      allComments = allComments.concat(
        commentsObj[category as keyof CommentHighlights],
      );
    });

    allComments.sort(
      (a, b) => b.informativeness_score - a.informativeness_score,
    );
    selectedComments = allComments.slice(0, 3).map((comment) => {
      let highlightedComment = highlightTakeaways(
        comment.comment,
        comment.key_positive_sentiment_takeaways,
        "text-green-700",
      );
      return highlightTakeaways(
        highlightedComment,
        comment.key_negative_sentiment_takeaways,
        "text-danger",
      );
    });
  }

  return selectedComments;
}
