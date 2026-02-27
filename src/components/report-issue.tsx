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
import { useState, useTransition } from "react";
import { TranslatableText } from "./translatable-text";
import axios from "axios";
import { toast } from "sonner";
import { isEmailOrPhone } from "@/lib/utils";
import Spinner from "./spinner";
import { Button } from "./ui/button";

export function ReportIssueForm({
  location,
  hideReportIssueForm,
}: {
  location: YourPeerLegacyLocationData;
  hideReportIssueForm: () => void;
}) {
  const [isShowingSuccessForm, setIsShowingSuccessForm] = useState(false);
  const [contactInfo, setContactInfo] = useState("");
  const [isLoading, startTransition] = useTransition();

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    const checks = (event.target as HTMLFormElement).querySelectorAll(
      "input[type=checkbox]",
    );
    const currentUrl = window.location.href;
    let issues = `Error report for *${location.name}*\n${currentUrl}\n`;
    for (let i = 0; i < checks.length; i++) {
      if ((checks[i] as HTMLInputElement).checked) {
        issues += (checks[i] as HTMLInputElement).value + "\n";
      }
    }
    const reportContent = (
      (event.target as HTMLFormElement).querySelector(
        "#reportContent",
      ) as HTMLInputElement
    ).value;
    issues += reportContent;

    if (!reportContent.trim()) {
      toast("Please describe the issue before sending.");
      return;
    }

    if (contactInfo.trim()) {
      if (!isEmailOrPhone(contactInfo)) {
        toast("Please enter a valid email or phone number.");
        return;
      }
      issues += `\nContact info: ${contactInfo}`;
    }

    startTransition(async () => {
      try {
        await axios.post("/api/report", { text: issues });
        setIsShowingSuccessForm(true);
      } catch (e) {
        console.error(e);
        alert("Error creating report");
        hideReportIssueForm();
      }
    });
  }

  return (
    <form
      className="w-full h-auto flex flex-col bg-white"
      id="reportContainer"
      onSubmit={submitReport}
    >
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
      ) : (
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
                            value={service.name?.toString()}
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
                <TranslatableText text="Please describe the issue below" />
                <br />
                <span className="text-sm text-gray-500 font-normal">
                  Please don&apos;t enter private information
                </span>
              </label>
              <div className="mt-4">
                <textarea
                  id="reportContent"
                  className="w-full focus:ring-primary text-sm resize-none border-neutral-500 rounded"
                  rows={6}
                  placeholder="Describe the issue here"
                ></textarea>
              </div>
            </div>

            <div id="StepThree" className="mt-8">
              <label
                htmlFor="reportContactInfo"
                className="text-base text-dark font-medium"
              >
                <span>How can we reach you?</span>
                <br />
                <span className="text-sm text-gray-500 font-normal">
                  we&apos;ll only use your contact info to follow up about this
                  issue, nothing else.
                </span>
              </label>
              <div className="mt-4">
                <input
                  id="reportContactInfo"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full focus:ring-primary text-sm resize-none border-neutral-500 rounded placeholder:text-neutral-500"
                  placeholder="Your email or phone number"
                />
              </div>
            </div>

            <div className="py-5">
              <Button
                className="mt-5 w-full rounded-md"
                disabled={isLoading}
                id="reportActionButton"
                type="submit"
              >
                <span>Send</span> {isLoading && <Spinner />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
