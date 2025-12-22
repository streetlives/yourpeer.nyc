import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CommentContent, CommentHighlights } from "@/components/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmailOrPhone(input: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex =
    /^\+{0,2}([\-\. ])?(\(?\d{0,3}\))?([\-\. ])?\(?\d{0,3}\)?([\-\. ])?\d{3}([\-\. ])?\d{4}/;

  return emailRegex.test(input) || phoneRegex.test(input);
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
    commentsObj[category as keyof CommentHighlights] =
      commentsObj[category as keyof CommentHighlights];
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

  // Select one from each category by informativeness score
  availableCategories.forEach((category) => {
    let sortedComments = commentsObj[category as keyof CommentHighlights].sort(
      (a, b) => b.informativeness_score - a.informativeness_score,
    );
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
