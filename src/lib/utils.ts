import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CommentContent,
  CommentHighlights,
  CommentHighlightsItem,
} from "@/components/common";

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

  // function highlightTakeaways(
  //   comment: string,
  //   takeaways: string[],
  //   className: string,
  // ): string {
  //   takeaways.forEach((takeaway) => {
  //     const regex = new RegExp(`(${takeaway})`, "gi");
  //     comment = comment.replace(regex, `<span class='${className}'>$1</span>`);
  //   });
  //   return comment;
  // }

  function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightTakeaways(
    comment: string,
    takeaways: string[],
    className: string,
  ): string {
    if (!takeaways.length) return comment;

    const escapedTakeaways = takeaways.map(escapeRegExp);
    const regex = new RegExp(`\\b(${escapedTakeaways.join("|")})\\b`, "gi");

    // Avoid double-wrapping already highlighted spans
    return comment.replace(regex, (match) => {
      const alreadyHighlighted = match.includes(`<span class='${className}'`);
      return alreadyHighlighted
        ? match
        : `<span class='${className}'>${match}</span>`;
    });
  }

  // do some preprocessing to filter out empty strings
  // and comments with low informativeness score
  categories.forEach((category) => {
    commentsObj[category as keyof CommentHighlights] = commentsObj[
      category as keyof CommentHighlights
    ].filter((comment) => comment.informativeness_score >= 4);
    commentsObj[category as keyof CommentHighlights].forEach((comment) => {
      comment.key_negative_sentiment_takeaways =
        comment.key_negative_sentiment_takeaways.filter((s) => s !== "");
      comment.key_positive_sentiment_takeaways =
        comment.key_positive_sentiment_takeaways.filter((s) => s !== "");
    });
  });

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
        "text-green-600",
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
        "text-green-600",
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

export function generateSlackMessageText(
  comment: CommentContent,
  locationUrl: string,
): string {
  const lines: string[] = [
    "*A comment has been reported.*",
    `*Location:* ${locationUrl}`,
    "*Comment:*",
  ];

  if (typeof comment === "string") {
    lines.push(comment);
  } else {
    if (comment.whatWentWell) {
      lines.push(`• *What went well:* ${comment.whatWentWell}`);
    }

    if (comment.whatCouldBeImproved) {
      lines.push(`• *What could be improved:* ${comment.whatCouldBeImproved}`);
    }

    if (
      comment.whatServicesDidYouUse &&
      comment.whatServicesDidYouUse.length > 0
    ) {
      lines.push("• *Services used:*");
      comment.whatServicesDidYouUse.forEach((service) => {
        lines.push(`   - ${service}`);
      });
    }
  }

  return lines.join("\n");
}
