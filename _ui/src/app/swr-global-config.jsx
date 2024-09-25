"use client";
import { SWRConfig } from "swr";

export default function SwrConfigGlobal({ children }) {
	return (
		<SWRConfig value={{ shouldRetryOnError: true, errorRetryCount: 3 }}>
			{children}
		</SWRConfig>
	);
}
