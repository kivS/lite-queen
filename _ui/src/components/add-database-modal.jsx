"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { wait, ROOT_URL } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { loadDatabase } from "@/lib/data";

export function AddDatabaseModal({
	children,
	setDbSwitcherOpen,
	open,
	setOpen,
}) {
	const router = useRouter();
	const [isChecking, setIsChecking] = React.useState(false);
	const [dbAlias, setDbAlias] = React.useState("");

	const { toast } = useToast();
	const { mutate } = useSWRConfig();

	const searchParams = useSearchParams();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="max-w-[95%] sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Load a Sqlite database</DialogTitle>

					{/* <DialogDescription>

                    </DialogDescription> */}
				</DialogHeader>

				<section>
					<form
						id="load_db_form"
						action="post"
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
					>
						<div className="mt-4 flex flex-col gap-1.5">
							<Input
								type="text"
								name="db_path"
								onChange={updateAlias}
								placeholder="/path/to/db.sqlite3"
								required
								className=""
							/>
							<Label htmlFor="db_path" className="text-xs opacity-60 ml-1.5">
								Absolute path to the database file
							</Label>
						</div>

						<div className="flex flex-col gap-1.5 w-full">
							<Input
								type="text"
								name="db_alias"
								value={dbAlias}
								onChange={(e) => setDbAlias(e.target.value)}
								placeholder="Funny Cats"
								className=""
							/>
							<Label className="text-xs ml-1.5 opacity-60">
								The name that the database will be saved as
							</Label>
						</div>
					</form>
				</section>

				<DialogFooter>
					<Button
						form="load_db_form"
						type="submit"
						className=""
						disabled={isChecking}
					>
						{isChecking && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
						{isChecking ? "Loading..." : "Load"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	async function handleSubmit(e) {
		e.preventDefault();

		setIsChecking(true);

		const formData = new FormData(e.target);

		// console.log(Object.fromEntries(formData))

		try {
			const response = await loadDatabase(formData);

			// console.log(response)

			await wait(300); // zoom! did you see that?! here, I'll go again: zoom!

			if (response.ok) {
				setIsChecking(false);
				router.push(`/db?db_id=${response.data.db_id}`);
				if (typeof setOpen === "function") setOpen(false);
				// refresh the database switcher loaded databases
				mutate(`${ROOT_URL}/api/get-loaded-databases`);
				if (setDbSwitcherOpen) setDbSwitcherOpen(false);
			}

			if (!response.ok) {
				setIsChecking(false);
				toast({
					title: response.message,
					description: response.context,
					variant: "destructive",
					// duration: 10_000,
				});
			}
		} catch (error) {
			await wait(300); // zoom!
			console.error("Can't connect to Lite Queen: ", error);
			setIsChecking(false);
			toast({
				title: "Can't connect to Lite Queen",
				description: "Please check if Lite Queen is running and try again.",
				variant: "destructive",
			});
		}
	}

	function updateAlias(e) {
		const path = e.target.value;
		const filename = path.split("/").pop();
		setDbAlias(filename);
	}
}
