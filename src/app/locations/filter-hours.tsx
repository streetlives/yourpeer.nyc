import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import classNames from "classnames";
import { OPEN_PARAM } from "../common";
import { getUrlWithNewFilterParameter, getUrlWithoutFilterParameter } from "../navigation";

export default function FilterHours() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpenNow = !!searchParams.get(OPEN_PARAM);
  const commonClasses = [
    "text-xs",
    "relative",
    "flex-1",
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "cursor-pointer",
    "border",
    "py-2",
    "px-5",
    "focus:outline-none",
  ];
  const selectedClasses = ["bg-primary", "border-black"];
  const notSelectedClasses = [
    "bg-white",
    "border-gray-300",
  ];

  function handleIsOpenNowClick() {
    router.push(getUrlWithNewFilterParameter(pathname, searchParams, OPEN_PARAM));
  }

  function handleIsNotOpenNowClick() {
    router.push(getUrlWithoutFilterParameter(pathname, searchParams, OPEN_PARAM));
  }

  return (
    <fieldset className="mt-6" id="filter_hours">
      <legend className="text-xs font-semibold leading-6 text-dark">
        Opening hours
      </legend>
      <div className="mt-2 flex w-full">
        <label
          className={classNames.call(
            null,
            commonClasses
              .concat("rounded-l-lg")
              .concat(isOpenNow ? notSelectedClasses : selectedClasses)
          )}
        >
          <input
            type="radio"
            id="filter_not_open_now"
            name="not_open_now"
            value={!isOpenNow ? "true" : undefined}
            className="sr-only"
            aria-labelledby="openingHours-0-label"
            aria-describedby="openingHours-0-description-0 openingHours-0-description-1"
            onClick={handleIsNotOpenNowClick}
          />
          Any
        </label>
        <label
          className={classNames.call(
            null,
            commonClasses
              .concat("rounded-r-lg")
              .concat(isOpenNow ? selectedClasses : notSelectedClasses)
          )}
        >
          <input
            id="filter_open_now"
            type="radio"
            name="open_now"
            value={isOpenNow ? "true" : undefined}
            className="sr-only"
            aria-labelledby="openingHours-0-label"
            aria-describedby="openingHours-0-description-0 openingHours-0-description-1"
            onClick={handleIsOpenNowClick}
          />
          Open now
        </label>
      </div>
    </fieldset>
  );
}
