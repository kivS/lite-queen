"use client";

/**
 * here we're loading the lemon script before the component is interactive
 * cuz the overlay wasn't working otherwise since the script was not available yet.
 * although it doesn't break that way(link fallback navigates away just fine), we want
 * that sweet overlay!
 */

import Script from "next/script";
import { useEffect } from "react";
import { Cart, IconCart } from "./icons";

const price = 79;

export default function BuyCard({ className, ...props }) {
	return (
		<div
			id="purchase"
			onMouseEnter={(e) => {
				// console.log("mouse is over it");
				if (!logo.classList["animate-pulse"]) {
					logo.classList.add("animate-pulse");
				}
			}}
			onMouseLeave={(e) => {
				// console.log("mouse it out");
				logo.classList.remove("animate-pulse");
			}}
			className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0"
			{...props}
		>
			<div className="rounded-2xl bg-stone-50 dark:bg-transparent  py-4 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-6">
				<div className="mx-auto max-w-xs px-8">
					<p className="text-base font-semibold text-gray-600 dark:text-white">
						Pay once, own it forever
					</p>
					<p className="mt-6 flex items-baseline justify-center gap-x-2">
						<span className="text-5xl font-bold tracking-tight  text-gray-900 dark:text-white">
							${price}
						</span>
						<span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-white">
							USD
						</span>
					</p>

					<p className="text-xs  tracking-tight">+ taxes</p>

					<Script
						strategy="beforeInteractive"
						src="https://assets.lemonsqueezy.com/lemon.js"
					/>
					<a
						href={
							process.env.NODE_ENV === "development"
								? "https://litequeen.lemonsqueezy.com/buy/eaedd923-5119-47ab-bbab-675909256f33?embed=1"
								: "https://litequeen.lemonsqueezy.com/buy/4a5e2ffc-59f3-4ef1-abe2-5e0744f409aa?embed=1&discount=0"
						}
						className="lemonsqueezy-button flex justify-center items-center gap-2 mt-10  w-full rounded-md bg-teal-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
					>
						<IconCart className="size-4" />
						<span className="text-lg"> Buy</span>
					</a>
					<p className="mt-6 text-xs  font-semibold leading-5 text-gray-800 dark:text-white">
						Availabe for <span>Linux</span>,<span> MacOS</span>,
						<span className="opacity-50 cursor-not-allowed">
							{" "}
							Windows(soon)
						</span>
					</p>
					<p className="mt-0 text-xs leading-5 text-gray-800 dark:text-white">
						Updates & support for 1 year with each purchase
					</p>
				</div>
			</div>
		</div>
	);
}
