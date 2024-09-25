"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./Button";
import BuyCard from "./buy-card";
import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function BuyModal() {
	const [open, setOpen] = React.useState(false);
	const searchParams = useSearchParams();
	const show_buy_card = searchParams.get("show-buy-card");

	React.useEffect(() => {
		if (show_buy_card === "true") {
			setOpen(true);
		}
	}, [show_buy_card]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					data-umami-event="Buy license button"
					className="font-medium text-landing-accent-light hover:scale-105"
				>
					Get a license key
				</button>
			</DialogTrigger>
			<DialogContent
				className="flex dark:border-none justify-center bg-white dark:bg-starryBlue-dark"
				onOpenAutoFocus={(e) => {
					e.preventDefault();
				}}
			>
				<BuyCard />
			</DialogContent>
		</Dialog>
	);
}
