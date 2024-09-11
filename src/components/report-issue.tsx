// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  CATEGORIES,
  getServicesWrapper,
  YourPeerLegacyLocationData,
} from "./common";
import { useState } from "react";
import { TranslatableText } from "./translatable-text";

export function ReportCompletedView() {
  return (
    <div
      id="reportCompletedView"
      className="flex items-center flex-col justify-center w-2/3 mx-auto mt-10"
    >
      <div className="text-center text-dark font-medium text-base mb-2">
        Thank you so much!
      </div>
      <p className="text-sm tex-dark font-normal mb-4 text-center">
        You&apos;re helping everyone to get more reliable information and making
        it easier for people to get the help they need.
      </p>
      <div className="flex justify-center">
        <button className="primary-button">
          <span>Done</span>
        </button>
      </div>
    </div>
  );
}

export function ReportIssueForm({
  location,
  hideReportIssueForm,
}: {
  location: YourPeerLegacyLocationData;
  hideReportIssueForm: () => void;
}) {
  const [isShowingSuccessForm, setIsShowingSuccessForm] = useState(false);
  function sendEmailReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    const checks = (event.target as HTMLFormElement).querySelectorAll(
      "input[type=checkbox]",
    );
    const currentUrl = window.location.href;
    let issues = currentUrl + "\n";
    for (let i = 0; i < checks.length; i++) {
      if ((checks[i] as HTMLInputElement).checked) {
        issues += (checks[i] as HTMLInputElement).value + "\n";
      }
    }
    issues += (
      (event.target as HTMLFormElement).querySelector(
        "#reportContent",
      ) as HTMLInputElement
    ).value;
    fetch("/api/report", {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
      body: issues,
    }).then(() => {
      setIsShowingSuccessForm(true);
    });
  }
  return (
    <form
      className="w-full h-auto flex flex-col bg-white"
      id="reportContainer"
      onSubmit={sendEmailReport}
    >
      <div className="px-5">
        <div id="reportView">
          <div id="stepOne">
            <div className="text-lg font-medium">
              <TranslatableText text="Which parts of the information have an issue?" />
            </div>
            <div className="flex flex-col mt-4">
              <label className="relative flex-1 flex space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="issuePart"
                  value="Information about the location"
                  className="w-5 h-5 text-primary !border-dark !border ring-dark focus:ring-dark issue"
                />
                <span className="text-xs text-dark mt-0.5">
                  Information about the location
                </span>
              </label>
              {CATEGORIES.filter((serviceCategory) => {
                const servicesWrapper = getServicesWrapper(
                  serviceCategory,
                  location,
                );
                return servicesWrapper.services.length;
              }).map((serviceCategory) => {
                const servicesWrapper = getServicesWrapper(
                  serviceCategory,
                  location,
                );
                return (
                  <div key={serviceCategory}>
                    {servicesWrapper.services.map((service) => (
                      <label
                        className="relative flex-1 flex space-x-2 cursor-pointer mt-3"
                        key={service.id}
                      >
                        <input
                          type="checkbox"
                          name="issuePart"
                          className="w-5 h-5 text-primary !border-dark !border ring-dark focus:ring-dark issue"
                        />{" "}
                        {service.name ? (
                          <TranslatableText
                            className="text-xs text-dark mt-0.5"
                            text={service.name}
                            expectTranslation={false}
                          />
                        ) : undefined}{" "}
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          <div id="StepTwo" className="mt-8">
            <label
              htmlFor="reportContent"
              className="text-base text-dark font-medium"
            >
              <TranslatableText text="Please describe the issue below (Please don't enter any private information)" />
            </label>
            <div className="mt-4">
              <textarea
                id="reportContent"
                className="w-full focus:ring-primary resize-none border-neutral-500 rounded"
                rows={6}
                placeholder="..."
              ></textarea>
            </div>
          </div>
          <div className="py-5">
            <input
              className="primary-button mt-5 w-full block"
              id="reportActionButton"
              type="submit"
              value="Send"
            ></input>
          </div>
        </div>
      </div>
      {isShowingSuccessForm ? (
        <div
          id="reportCompletedView"
          className="flex items-center flex-col justify-center w-2/3 mx-auto mt-10"
        >
          <div className="text-center text-dark font-medium text-base mb-2">
            Thank you so much!
          </div>
          <p className="text-sm tex-dark font-normal mb-4 text-center">
            You&apos;re helping everyone to get more reliable information and
            making it easier for people to get the help they need.
          </p>
          <div className="flex justify-center">
            <button className="primary-button" onClick={hideReportIssueForm}>
              <span>Done</span>
            </button>
          </div>
        </div>
      ) : undefined}
    </form>
  );
}
