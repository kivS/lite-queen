import { Inter } from "next/font/google";

import clsx from "clsx";
import Script from "next/script";
import { Providers } from "@/app/providers";

import "@/styles/tailwind.css";

import { TailwindIndicator } from "@/components/tailwind-indicator";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata = {
	title: "Lite Queen - Manage SQLite databases on your server with ease",
	description:
		"Lite Queen is a SQLite database management software that runs on your server. Simply download the executable, run it, open the url on the browser and you're ready to go!",
	alternates: {
		types: {
			"application/rss+xml": "https://litequeen.com/feed.xml",
		},
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={clsx("h-full antialiased", inter.className)}
			suppressHydrationWarning
		>
			<body className="flex min-h-full flex-col bg-white dark:bg-gray-950">
				<Providers>
					{children}

					{process.env.NODE_ENV === "production" && (
						<Script
							src="https://umami.arm.vikborges.com/script.js"
							data-website-id="ba1b7ef1-f76b-4be3-b44a-0372b83e9cf9"
							strategy="afterInteractive"
						/>
					)}
				</Providers>
				<TailwindIndicator />
			</body>
		</html>
	);
}
