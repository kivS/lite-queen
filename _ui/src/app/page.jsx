"use client";

import { Button } from "@/components/ui/button";
import { wait, ROOT_URL, fetcher, updatePageTitle } from "@/lib/utils";
import useSWR from "swr";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AddDatabaseModal } from "@/components/add-database-modal";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense, useEffect, useState, useTransition } from "react";
import { getBuildInfo, useGetLoadedDatabases } from "@/lib/data";
import { PackageIcon } from "lucide-react";

export default function Home() {
	const { data, error, isLoading } = useGetLoadedDatabases();
	const [buildInfo, setBuildInfo] = React.useState();
	const [isBuildInfoTransactionPending, startBuildInfoTransition] =
		useTransition();

	console.debug({ loaded_databases: data });

	if (error)
		throw new Error("Failed to connect. Is the Lite Queen executable running?");

	useEffect(() => {
		updatePageTitle("Home");
	}, []);

	React.useEffect(() => {
		startBuildInfoTransition(() => {
			getBuildInfo().then((result) => {
				if (result) {
					try {
						const formattedDate = new Date(
							result?.latest_build_update_datetime,
						).toLocaleString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
							timeZoneName: "short",
						});

						setBuildInfo((prevState) => ({
							...prevState,
							latest_build_update_datetime: formattedDate,
						}));
					} catch (error) {
						console.warn("Latest update date error: ", error);
					}
				}
			});
		});
	}, []);

	return (
		<>
			<header className="w-full flex justify-end container py-4">
				<ThemeToggle />
			</header>
			<main className="flex items-center flex-col gap-10 py-10 flex-grow">
				<Suspense>
					<AddDatabaseModal>
						<Button variant="outline">Add Database</Button>
					</AddDatabaseModal>
				</Suspense>

				<div className="grid gap-4 grid-cols-1 sm:grid-cols-3 bg-slate-200 dark:bg-transparent h-dvh p-6 max-h-96 overflow-y-scroll rounded border max-w-screen-lg mx-10">
					{isLoading &&
						[...Array(9)].map((_, i) => (
							<Skeleton key={i} className="aspect-video h-20 w-56" />
						))}

					{data?.databases && Object.keys(data?.databases).length === 0 ? (
						<AddDatabaseModal>
							<p
								role="button"
								className="w-full text-center hover:cursor-pointer"
							>
								Start by adding a database.
							</p>
						</AddDatabaseModal>
					) : null}

					{data &&
						Object.entries(data?.databases).map(([db_id, db]) => (
							<Link key={db_id} href={`/db?db_id=${db_id}`}>
								<Card className="">
									<CardContent className="p-6">
										<p className="truncate w-full text-center">{db.db_alias}</p>
									</CardContent>
									<CardFooter className="p-2">
										<div className="text-xs flex justify-end w-full">
											<div className="flex gap-1 items-center">
												<PackageIcon className="size-3" />
												<DatabaseSize size={db?.db_size_in_bytes} />
											</div>
										</div>
									</CardFooter>
								</Card>
							</Link>
						))}
				</div>

				<div>
					<p className="text-[10px] text-muted-foreground pb-2 pr-4 text-right">
						Lite Queen last updated on:{" "}
						{buildInfo?.latest_build_update_datetime || "loading..."}
					</p>
				</div>
			</main>
		</>
	);
}

function DatabaseSize({ size }) {
	const [humanFriendlySize, setHumanFriendlySize] = useState("0 B");

	useEffect(() => {
		if (size) {
			const result = Intl.NumberFormat("en", {
				notation: "compact",
				style: "unit",
				unit: "byte",
				unitDisplay: "narrow",
			}).format(size);

			setHumanFriendlySize(result);
		}
	}, [size]);

	return <span>{humanFriendlySize}</span>;
}
