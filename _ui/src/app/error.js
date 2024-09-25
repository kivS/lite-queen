"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.log(error);
	}, [error]);

	return (
		<div className="flex-1 flex flex-col gap-10 items-center justify-center m-4">
			<h2 className="text-4xl text-pretty text-center">
				Something went wrong!
			</h2>

			<div className="text-red-500 text-lg text-pretty text-center">
				{error?.message}
			</div>

			<Button onClick={() => window.location.reload()}>
				<RefreshCcw width={24} height={24} className="size-4" />
			</Button>
		</div>
	);
}
