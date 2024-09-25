"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import {
	deleteDatabase,
	updateDatabaseSettings,
	useGetDatabaseInfo,
	useGetLoadedDatabases,
} from "@/lib/data";
import { Trash2Icon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function DbSettingsModal({ children, db_id }) {
	const router = useRouter();
	const [isChecking, setIsChecking] = React.useState(false);

	const [currentDbInfo, setCurrentDbInfo] = React.useState();

	const [open, setOpen] = useState();

	const { toast } = useToast();
	const { mutate } = useSWRConfig();

	const { data: loadedDbs, isLoading: isDbInfoLoading } =
		useGetLoadedDatabases();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		console.log({ currentDbInfo });
		setCurrentDbInfo(loadedDbs?.databases[db_id]);
	}, [loadedDbs, db_id]);

	// console.log(loadedDbs?.databases[db_id])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent
				className="max-w-[95%] md:max-w-xl"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>Database settings</DialogTitle>

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
							<Label htmlFor="db_path" className="text-xs opacity-60 ml-1.5">
								Absolute path to the database file
							</Label>
							<Input
								type="text"
								name="db_path"
								onChange={updateAlias}
								value={currentDbInfo?.db_path}
								placeholder="/path/to/db.sqlite3"
								required
								className=""
							/>
						</div>

						<Separator className="my-1 mx-auto w-1/2" />

						<div className="flex flex-col gap-1.5 w-full">
							<Label className="text-xs ml-1.5 opacity-60">
								The name that the database will be saved as
							</Label>
							<Input
								type="text"
								name="db_alias"
								value={currentDbInfo?.db_alias}
								onChange={(e) =>
									setCurrentDbInfo((prevState) => ({
										...prevState,
										db_alias: e.target.value,
									}))
								}
								placeholder="Funny Cats"
								className=""
							/>
						</div>
					</form>
				</section>

				<DialogFooter className="gap-4 mt-4 flex justify-between sm:justify-between flex-row">
					<Button variant="icon" className="" onClick={handleDeleteDB}>
						<Trash2Icon className="h-4 w-4" />
					</Button>
					<Button
						form="load_db_form"
						type="submit"
						className=""
						disabled={isChecking}
					>
						{isChecking && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
						{isChecking ? "Updating..." : "Update"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	async function handleSubmit(e) {
		e.preventDefault();

		setIsChecking(true);

		const formData = new FormData(e.target);

		formData.set("db_id", db_id);

		try {
			await wait(300); // zoom! did you see that?! here, I'll go again: zoom!

			const request = await updateDatabaseSettings(formData);

			console.log(request);

			if (request.ok) {
				mutate(`${ROOT_URL}/api/get-database-info?db_id=${db_id}`);
				mutate(`${ROOT_URL}/api/get-loaded-databases`);

				setIsChecking(false);
				setOpen(false);

				toast({
					description: request?.message,
				});
			}

			if (!request.ok) {
				setIsChecking(false);
				toast({
					title: request.message,
					description: request.context,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Can't connect to Lite Queen: ", error);
			setIsChecking(false);
			toast({
				title: "Can't connect to Lite Queen",
				description: error?.message,
				variant: "destructive",
			});
		}
	}

	/**
	 * @param {Event} e - The event object
	 * @returns {void}
	 */
	async function handleDeleteDB(e) {
		e.preventDefault();

		const y = confirm("Are you sure you want to delete?");

		if (y) {
			console.log("deleting database...");
			const result = await deleteDatabase(db_id);

			if (result.ok) {
				mutate(`${ROOT_URL}/api/get-loaded-databases`);
				setIsChecking(false);
				setOpen(false);

				toast({
					description: "Database deleted",
				});

				router.replace("/");
			} else {
				toast({
					title: "Error deleting",
					description: result?.message,
					variant: "destructive",
				});
			}
			console.log(result);
		}
	}

	function updateAlias(e) {
		const path = e.target.value;
		const filename = path.split("/").pop();

		setCurrentDbInfo((prevState) => ({
			...prevState,
			db_alias: filename,
			db_path: path,
		}));
	}
}
