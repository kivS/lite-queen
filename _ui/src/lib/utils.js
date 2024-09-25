import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect } from "react";
import { AppearanceSettings } from "./data";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// when in dev mode, use make requests to the api server in another port, eg: localhost:8000
export const ROOT_URL =
	process.env.NODE_ENV === "development"
		? process.env.NEXT_PUBLIC_DEV_SITE_URL
		: "";

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const updatePageTitle = (title) => {
	const windowLabel = AppearanceSettings.getWindowLabel();
	let document_title = title || "";

	if (windowLabel) {
		document_title = `(${windowLabel}) ${title}`;
	}

	document.title = document_title;
};

/**
 * Returns the relative time difference from a date.
 *
 * Eg: "2023/01/01" => "One year ago"
 * @param {string} date
 * @returns {string | null }
 */
export function timeAgo(input_date) {
	try {
		const now = new Date();

		// we have to coerce the input_date as UTC, since we're assuming it was created in UTC
		const date = new Date(
			input_date.endsWith("Z") ? input_date : input_date + "Z",
		);

		const secondsAgo = Math.round((now - date) / 1000);

		const minutesAgo = Math.round(secondsAgo / 60);
		const hoursAgo = Math.round(minutesAgo / 60);
		const daysAgo = Math.round(hoursAgo / 24);
		const monthsAgo = Math.round(daysAgo / 30);
		const yearsAgo = Math.round(daysAgo / 365);

		const rtf = new Intl.RelativeTimeFormat("en", {
			numeric: "auto",
			style: "long",
		});

		if (secondsAgo < 60) {
			return rtf.format(-secondsAgo, "second");
		} else if (minutesAgo < 60) {
			return rtf.format(-minutesAgo, "minute");
		} else if (hoursAgo < 24) {
			return rtf.format(-hoursAgo, "hour");
		} else if (daysAgo < 30) {
			return rtf.format(-daysAgo, "day");
		} else if (monthsAgo < 12) {
			return rtf.format(-monthsAgo, "month");
		} else {
			return rtf.format(-yearsAgo, "year");
		}
	} catch (error) {
		console.warn(`Can't make time ago for [${input_date}] | reason: ${error}`);
		return null;
	}
}

/**
 * Checks if a string is a valid date/datetime string
 * @param {string} str
 * @returns {boolean}
 */
export function isValidDateTimeString(str) {
	if (str == null) return false;
	if (String(str)?.length < 8) return false; // 2023-1-1

	const date = new Date(str);
	return !Number.isNaN(date.getTime());
}

/**
 * Determines if a database column is likely of type DateTime based on its type or default value.
 * @param {string | null} column_type The type of the database column.
 * @param {string | null} default_value The default value of the database column.
 * @returns {boolean} True if the column is likely of type DateTime, false otherwise.
 */
export function isDbColumnLikelyOfTypeDateTime(
	column_type = null,
	default_value = null,
) {
	if (column_type && column_type.toLowerCase().includes("date")) {
		return true;
	}

	if (default_value && default_value.toUpperCase() === "CURRENT_TIMESTAMP") {
		return true;
	}

	return false;
}

/**
 *
 * @param {Number} n
 * @returns
 */
export function NumberToHuman(n) {
	const input = Number.parseInt(n);

	return new Intl.NumberFormat(navigator.languages, {
		notation: "compact",
		compactDisplay: "short",
	}).format(input);
}
