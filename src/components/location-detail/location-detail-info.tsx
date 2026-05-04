"use client";

import {
  YourPeerLegacyLocationData,
  YourPeerLegacyPhoneData,
} from "@/components/common";

function normalizeWebsiteUrl(url: string): string | undefined {
  if (url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
  }
  return url;
}

function renderNormalizedWebsiteUrl(url: string): string | undefined {
  const fullyQualifiedUrl = normalizeWebsiteUrl(url);
  if (fullyQualifiedUrl) {
    return fullyQualifiedUrl.replace(/^https?:\/\//, "");
  }
}

type FormattedPhone = {
  display: string;
  href?: string;
  external?: boolean;
  key: string;
};

type PhoneUse = "phone" | "sms" | "whatsapp" | "fax";

const extensionPattern = /(?:ext\.?|extension|x)\s*[:#-]?\s*(\d+)\s*$/i;

function normalizePhoneUse(type?: string | null): PhoneUse {
  const normalizedType = (type ?? "").toLowerCase().replace(/[\s_-]+/g, "");

  if (normalizedType.includes("whatsapp")) {
    return "whatsapp";
  }

  if (normalizedType.includes("sms") || normalizedType.includes("text")) {
    return "sms";
  }

  if (normalizedType.includes("fax")) {
    return "fax";
  }

  return "phone";
}

function phoneCanHaveExtension(phoneUse: PhoneUse): boolean {
  return phoneUse === "phone";
}

function normalizePhoneDigits(rawNumber: string): string {
  const digits = rawNumber.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

function formatPhoneDigits(digits: string): string {
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return digits;
}

function getPhoneLabel(
  phone: YourPeerLegacyPhoneData,
  phoneUse: PhoneUse,
): string | null {
  if (phoneUse === "sms") {
    return "Text";
  }

  if (phoneUse === "whatsapp") {
    return "WhatsApp";
  }

  if (phoneUse === "fax") {
    return "Fax";
  }

  const customType = phone.type === "Phone" ? null : phone.type;
  return phone.description || customType || null;
}

function getPhoneDetails(
  phone: YourPeerLegacyPhoneData,
  label: string | null,
): string | null {
  if (!phone.description || phone.description === label) {
    return null;
  }

  return phone.description;
}

function formatPhoneContact(
  phone: YourPeerLegacyPhoneData,
  index: number,
): FormattedPhone | null {
  const trimmed = phone.number.trim();
  if (!trimmed) {
    return null;
  }

  const phoneUse = normalizePhoneUse(phone.type);
  const allowExtension = phoneCanHaveExtension(phoneUse);
  const extensionMatch = trimmed.match(extensionPattern);
  let extension = `${phone.extension ?? ""}`.trim() || null;
  let numberPart = trimmed;

  if (extensionMatch) {
    if (allowExtension && !extension) {
      extension = extensionMatch[1];
    }
    numberPart = trimmed.slice(0, extensionMatch.index).trim();
  }

  let digits = normalizePhoneDigits(numberPart);
  if (!digits) {
    return {
      display: trimmed,
      key: phone.id ?? `${trimmed}-${index}`,
    };
  }

  if (digits.length > 10) {
    if (allowExtension && !extension) {
      extension = digits.slice(10);
    }
    digits = digits.slice(0, 10);
  }

  if (!allowExtension) {
    extension = null;
  }

  const label = getPhoneLabel(phone, phoneUse);
  const details = getPhoneDetails(phone, label);
  const formattedNumber = formatPhoneDigits(digits);
  const extensionText = extension ? ` x${extension}` : "";
  const detailsText = details ? ` (${details})` : "";
  const display = `${label ? `${label}: ` : ""}${formattedNumber}${extensionText}${detailsText}`;

  if (digits.length < 3 || digits.length > 10) {
    return {
      display,
      key: phone.id ?? `${digits}-${index}`,
    };
  }

  if (phoneUse === "fax") {
    return {
      display,
      key: phone.id ?? `${digits}-${index}`,
    };
  }

  if (phoneUse === "whatsapp") {
    return {
      display,
      href: digits.length === 10 ? `https://wa.me/1${digits}` : undefined,
      external: true,
      key: phone.id ?? `${digits}-${index}`,
    };
  }

  const dialableNumber = digits.length === 10 ? `+1${digits}` : digits;
  const href =
    phoneUse === "sms"
      ? `sms:${dialableNumber}`
      : `tel:${dialableNumber}${extension ? `;ext=${extension}` : ""}`;

  return {
    display,
    href,
    key: phone.id ?? `${digits}-${index}`,
  };
}

function getPhoneContacts(
  location: YourPeerLegacyLocationData,
): FormattedPhone[] {
  const phones = location.phones.length
    ? location.phones
    : location.phone
      ? [
          {
            id: null,
            number: location.phone,
            extension: null,
            type: null,
            language: null,
            description: null,
          },
        ]
      : [];

  return phones.flatMap((phone, index) => {
    const formattedPhone = formatPhoneContact(phone, index);
    return formattedPhone ? [formattedPhone] : [];
  });
}

export default function LocationDetailInfo({
  location,
}: {
  location: YourPeerLegacyLocationData;
}) {
  const phoneContacts = getPhoneContacts(location);

  return (
    <>
      {location.closed ? (
        <div className="mb-3">
          <div className="flex space-x-1.5">
            <span className="text-danger">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
            </span>

            <div>
              <p className="text-dark mb-0.5 font-medium text-sm">Closed</p>
              {location.info?.map((info) => (
                <p
                  key={info}
                  className="text-dark font-normal text-sm"
                  dangerouslySetInnerHTML={{
                    __html: info,
                  }}
                ></p>
              ))}
            </div>
          </div>
        </div>
      ) : undefined}
      <ul className="flex flex-col space-y-4">
        <li className="flex space-x-3">
          <img
            src="/img/icons/location.svg"
            className="flex-shrink-0 w-5 h-5 max-h-5"
            alt=""
          />
          <p className="text-dark text-sm ml-2">
            <span translate="no">{location.address}</span> <br />
            <span translate="no">{location.city}</span>
            <span>,</span> <span translate="no">{location.zip}</span> <br />
            {!location.closed ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.address},${location.city},${location.zip}`}
                target="_blank"
                className="text-blue underline hover:no-underline"
              >
                Get directions
              </a>
            ) : undefined}
          </p>
        </li>
        <>
          {!location.closed ? (
            <>
              {phoneContacts.map((phoneContact) => (
                <li
                  key={phoneContact.key}
                  translate="no"
                  className="flex space-x-3"
                >
                  <img
                    src="/img/icons/phone.svg"
                    className="flex-shrink-0 w-5 h-5 max-h-5"
                    alt=""
                  />
                  <p className="text-dark text-sm ml-2">
                    {phoneContact.href ? (
                      <a
                        href={phoneContact.href}
                        target={phoneContact.external ? "_blank" : undefined}
                        rel={
                          phoneContact.external
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-blue underline hover:no-underline"
                      >
                        {phoneContact.display}
                      </a>
                    ) : (
                      <span>{phoneContact.display}</span>
                    )}
                  </p>
                </li>
              ))}
              {location.email ? (
                <li translate="no" className="flex space-x-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-dark w-5 h-5 max-h-5 flex-shrink-0"
                  >
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                  <p className="text-dark text-sm ml-2">
                    <a
                      href={`mailto:${location.email}`}
                      className="text-blue underline hover:no-underline"
                    >
                      {location.email}
                    </a>
                  </p>
                </li>
              ) : undefined}
              {location.url ? (
                <li translate="no" className="flex space-x-3 overflow-hidden">
                  <img
                    src="/img/icons/cursor.svg"
                    className="flex-shrink-0 w-5 h-5 max-h-5"
                    alt=""
                  />
                  <p className="text-dark text-sm ml-2">
                    <a
                      href={normalizeWebsiteUrl(location.url)}
                      target="_blank"
                      className="text-blue underline hover:no-underline cursor-pointer"
                    >
                      {renderNormalizedWebsiteUrl(location.url)}
                    </a>
                  </p>
                </li>
              ) : undefined}
            </>
          ) : undefined}
        </>
      </ul>
    </>
  );
}
