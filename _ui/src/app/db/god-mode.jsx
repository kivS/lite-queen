"use client";

import React, { useEffect, useMemo, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import {
	BotIcon,
	CheckCheck,
	CheckCircle2,
	ChevronRightIcon,
	CommandIcon,
	DatabaseBackupIcon,
	DatabaseIcon,
	DownloadIcon,
	FanIcon,
	FilePlus2Icon,
	FilePlusIcon,
	HardDriveIcon,
	IceCream,
	LoaderIcon,
	PlusIcon,
	SearchIcon,
	StarsIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
	backupDatabase,
	executeRawSqlQuery,
	getDatabaseBackups,
	getDatabaseInfo,
	getTableColumns,
	makeChatGptRequest,
	useGetLoadedDatabases,
	useGetTableColumns,
} from "@/lib/data";
import { marked } from "marked";
import { ROOT_URL, wait } from "@/lib/utils";

import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGlobal } from "../global-context";
import { mutate } from "swr";
import { MultiSelect } from "@/components/multi-select";
import { useToast } from "@/components/ui/use-toast";

export default function GodMode() {
	const {
		isGodModeOpen,
		setGodModeOpen,
		godModeCurrentScreen,
		setGodModeCurrentScreen,
	} = useGlobal();

	const screens = {
		sql: <SqlModeScreen />,
		ai: <AiModeScreen />,
		go_anywhere: <GoAnyWhereScreen />,
		search: <SearchScreen />,
		backup: <BackupScreen />,
	};

	React.useEffect(() => {
		const down = (e) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setGodModeOpen((isGodModeOpen) => !isGodModeOpen);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<Dialog
			open={isGodModeOpen}
			onOpenChange={setGodModeOpen}
			className="bg-red-500"
		>
			<DialogTrigger asChild>
				<Button className="border-foreground">
					<span className="leading-tight sm:leading-normal">Go</span>
					<kbd className="hidden md:flex pointer-events-none h-5 select-none items-center gap-0.5 rounded  bg-none px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
						<CommandIcon width={10} height={10} />K
					</kbd>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[95%] lg:max-w-4xl">
				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => setGodModeCurrentScreen("go_anywhere")}
						data-selected={godModeCurrentScreen === "go_anywhere"}
						className="flex items-center justify-center gap-1 p-1 text-sm  w-14 data-[selected='true']:border-foreground  border-b-2 border-transparent"
					>
						<ChevronRightIcon width={14} height={14} />
					</button>
					<button
						type="button"
						onClick={() => setGodModeCurrentScreen("sql")}
						data-selected={godModeCurrentScreen === "sql"}
						className="flex items-center justify-center gap-1 p-1 text-sm  w-14 data-[selected='true']:border-foreground  border-b-2 border-transparent"
					>
						<DatabaseIcon width={14} height={14} />
						SQL
					</button>
					<button
						type="button"
						onClick={() => setGodModeCurrentScreen("ai")}
						data-selected={godModeCurrentScreen === "ai"}
						disabled
						title="Under Construction for a Better Experience!"
						className="disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 p-1 text-sm  w-14 data-[selected='true']:border-foreground  border-b-2 border-transparent"
					>
						<BotIcon width={16} height={16} />
						AI
					</button>
				</div>
				{screens[godModeCurrentScreen]}
			</DialogContent>
		</Dialog>
	);

	function BackupScreen() {
		const [isPending, startTransition] = useTransition();
		const searchParams = useSearchParams();
		const { toast } = useToast();

		const db_id = searchParams.get("db_id");

		const { data: database } = getDatabaseInfo(db_id);

		const { data, isLoading: backupsAreLoading } = getDatabaseBackups(db_id);

		return (
			<>
				<header>
					<h1 className="text-2xl text-center font-semibold">Manage Backups</h1>
					<p className="truncate text-center text-sm text-muted-foreground py-1">
						for <strong>{database?.db_alias} </strong>
					</p>
				</header>

				<Button
					type="button"
					size="sm"
					variant="link"
					disabled={isPending}
					className="w-40 justify-start p-0"
					onClick={() => {
						const formData = new FormData();
						formData.append("db_id", db_id);

						startTransition(async () => {
							const result = await backupDatabase(formData);
							if (!result.ok) {
								toast({
									title: "Failed to backup database",
									description: result?.message,
									variant: "destructive",
								});
							}
							mutate(`${ROOT_URL}/api/database-backups?db_id=${db_id}`);
						});
					}}
				>
					{isPending ? (
						<>
							Creating <LoaderIcon className="ml-1 size-4 animate-spin" />{" "}
						</>
					) : (
						<>
							<PlusIcon className="size-4 mr-1" /> Create
						</>
					)}
				</Button>

				{backupsAreLoading ? (
					<p>Loading backups...</p>
				) : (
					<table className="min-w-full border-collapse border border-gray-200">
						<thead>
							<tr className="text-sm">
								<th className="border border-gray-300 p-2">Created at</th>
								<th className="border border-gray-300 p-2">Backup File</th>
							</tr>
						</thead>
						<tbody className="">
							{data?.backups?.map((backup) => (
								<tr key={backup.file_name}>
									<td className="border border-gray-300 p-2 text-xs text-center">
										{new Date(backup.timestamp).toLocaleString()}
									</td>
									<td className="border border-gray-300 p-2 text-xs text-center">
										{backup.file_name}
									</td>
									<td className="border border-gray-300 text-xs text-center">
										<a
											href={`${ROOT_URL}/api/download-backup?db_id=${db_id}&file_name=${backup.file_name}`}
											download
											className="flex justify-center w-full"
										>
											<DownloadIcon />
										</a>
									</td>
								</tr>
							))}
							{data?.backups && data.backups.length === 0 ? (
								<tr>
									<td
										colSpan={2}
										className="border text-muted-foreground border-gray-300 p-2 text-center"
									>
										No backups found.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				)}
			</>
		);
	}

	function SearchScreen() {
		const searchParams = useSearchParams();
		const pathName = usePathname();
		const router = useRouter();
		const db_id = searchParams.get("db_id");
		const table = searchParams.get("table");

		const { data: table_columns } = getTableColumns(db_id, table);
		console.log(table_columns);

		const formRef = useRef(null);
		const queryInputRef = useRef(null);
		const multiSelectRef = useRef(null);

		const selected_columns_query = searchParams.get("search_by");
		const query_array = selected_columns_query?.split(",") || [];

		const [selectedColumns, setSelectedColumns] = React.useState(query_array);

		React.useEffect(() => {
			if (!table) setGodModeCurrentScreen("go_anywhere");

			multiSelectRef.current.focus();

			// formRef.current.focus();
		}, []);

		React.useEffect(() => {
			const search_query = searchParams.get("search");
			if (search_query) {
				queryInputRef.current.value = search_query;
			}
		}, [searchParams.get]);

		return (
			<div className="overflow-hidden">
				<h1 className="text-center text-lg">Search</h1>

				<form
					action=""
					onSubmit={handleSubmit}
					ref={formRef}
					className="flex flex-col md:flex-row gap-4 my-8"
				>
					<div className="ml-1">
						<MultiSelect
							ref={multiSelectRef}
							options={
								table_columns?.data?.map((column) => ({
									value: column.name,
									label: column.name.toUpperCase(),
									// icon: Cat, // Assuming each column has an icon property
								})) || []
							}
							onValueChange={setSelectedColumns}
							defaultValue={selectedColumns}
							modalPopover={true} // https://github.com/sersavan/shadcn-multi-select-component/issues/27#issuecomment-2398721574
							placeholder="Select columns to search by"
							// variant="inverted"
							animation={0}
							maxCount={2}
						/>
					</div>

					<div className="flex justify-center mb-4 flex-grow">
						<input
							type="text"
							name="search"
							ref={queryInputRef}
							placeholder="Enter your query and press enter"
							className="rounded p-2 border w-full"
						/>
					</div>
				</form>
			</div>
		);

		/**
		 *
		 * @param {SubmitEvent} e
		 */
		async function handleSubmit(e) {
			e.preventDefault();

			const formData = new FormData(e.target);
			formData.set("search_by", selectedColumns);
			console.log(Object.fromEntries(formData));

			if (selectedColumns.length < 1) {
				alert("Please select at least one column to search by");
				return;
			}

			const params = new URLSearchParams(searchParams);
			params.set("search", formData.get("search"));
			params.set("search_by", formData.get("search_by"));

			router.push(`${pathName}?${params.toString()}`);

			await wait(100);

			setGodModeOpen(false);
			setGodModeCurrentScreen("go_anywhere");
		}
	}

	function GoAnyWhereScreen() {
		const router = useRouter();
		const searchParams = useSearchParams();

		const db_id = searchParams.get("db_id");

		const { data: db_info } = getDatabaseInfo(db_id);

		const { data: loaded_dbs } = useGetLoadedDatabases();

		return (
			<Command loop>
				<CommandInput autoFocus placeholder="Type a command or search..." />

				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						{searchParams.has("table") && (
							<CommandItem onSelect={() => setGodModeCurrentScreen("search")}>
								<div className="flex gap-1 content-center items-center">
									<SearchIcon width={14} height={14} />
									Search in {searchParams.get("table")}
								</div>
							</CommandItem>
						)}

						<CommandItem onSelect={() => setGodModeCurrentScreen("sql")}>
							<div className="flex gap-1 content-center items-center">
								<DatabaseIcon width={14} height={14} />
								SQL Mode
							</div>
						</CommandItem>

						<CommandItem
							disabled
							onSelect={() => setGodModeCurrentScreen("ai")}
						>
							<div className="flex gap-1 content-center items-center">
								<BotIcon width={16} height={16} />
								AI Mode(Under Construction for a Better Experience!)
							</div>
						</CommandItem>
					</CommandGroup>

					<CommandSeparator />

					<CommandGroup heading="Tables">
						{db_info?.tables?.sort().map((table) => (
							<CommandItem
								key={table}
								onSelect={(val) => handleSelectedItem("tables", table)}
							>
								<div className="flex gap-1 content-center items-center">
									<HardDriveIcon width={16} height={16} />
									{table}
								</div>
							</CommandItem>
						))}
					</CommandGroup>

					<CommandSeparator />

					<CommandGroup heading="Databases">
						{loaded_dbs &&
							Object.entries(loaded_dbs.databases)
								.sort((a, b) => a[1].db_alias.localeCompare(b[1].db_alias))
								.map(([id, db]) => (
									<CommandItem
										key={id}
										onSelect={(val) => handleSelectedItem("databases", id)}
									>
										<div className="flex gap-1 content-center items-center">
											<DatabaseIcon width={16} height={16} />
											{db.db_alias}
										</div>
									</CommandItem>
								))}
					</CommandGroup>

					<CommandSeparator />

					<CommandGroup heading="Other">
						{searchParams.has("db_id") && (
							<CommandItem onSelect={() => setGodModeCurrentScreen("backup")}>
								<div className="flex gap-1 content-center items-center">
									<DatabaseBackupIcon width={14} height={14} />
									Database Backups
								</div>
							</CommandItem>
						)}
					</CommandGroup>
				</CommandList>
			</Command>
		);

		function handleSelectedItem(group, value) {
			console.log({ group }, { value });

			switch (group) {
				case "tables":
					console.log(`Opening table ${value}`);
					router.push(`/db/tables/?db_id=${db_id}&table=${value}`);
					break;

				case "databases":
					console.log(`Opening database ${value}`);
					router.push(`/db/?db_id=${value}`);
					break;
			}
			setGodModeOpen(false);
		}
	}

	function SqlModeScreen() {
		const [query, setQuery] = React.useState("");
		const [sqlResult, setSqlResult] = React.useState();
		const [sqlSqlResultError, setSqlResultError] = React.useState(null);
		const [isMakingSqlRequest, setIsMakingSqlRequest] = React.useState(false);
		const [queryResultNumber, setQueryResultNumber] = React.useState("");
		const queryFormRef = useRef(null);
		const queryTextAreaRef = useRef(null);
		const router = useRouter();
		const searchParams = useSearchParams();
		const db_id = searchParams.get("db_id");
		const table_name = searchParams.get("table");
		const search = searchParams.get("search") || "";
		const search_by = searchParams.get("search_by") || "";

		const SESSION_STORAGE_KEY = "sql_mode_screen";
		const SESSION_STORAGE_QUERY_KEY = `${SESSION_STORAGE_KEY}_query`;
		const SESSION_STORAGE_RESULT_KEY = `${SESSION_STORAGE_KEY}_result`;

		useEffect(() => {
			const savedQuery = localStorage.getItem(SESSION_STORAGE_QUERY_KEY);
			if (savedQuery) {
				setQuery(savedQuery);
			}

			const savedResult = localStorage.getItem(SESSION_STORAGE_RESULT_KEY);
			if (savedResult) {
				setSqlResult(JSON.parse(savedResult));
			}
		}, []);

		useEffect(() => {
			if (isGodModeOpen) {
				queryTextAreaRef.current.focus();
			}
		}, [isGodModeOpen]);

		useEffect(() => {
			localStorage.setItem(SESSION_STORAGE_QUERY_KEY, query);
		}, [query]);

		useEffect(() => {
			if (sqlResult == undefined) return;
			localStorage.setItem(
				SESSION_STORAGE_RESULT_KEY,
				JSON.stringify(sqlResult),
			);
		}, [sqlResult]);

		return (
			<>
				{/* <button>AI</button><button>SQL</button> */}
				<DialogHeader>
					{/* <DialogTitle>AI mode</DialogTitle> */}
					<DialogDescription className="mt-4 text-md sm:text-xl text-foreground ">
						Query your database with SQL
					</DialogDescription>
				</DialogHeader>

				{isMakingSqlRequest == false &&
					sqlSqlResultError == null &&
					queryResultNumber && (
						<div className="text-sm text-center font-medium flex gap-1 items-center justify-center">
							<CheckCircle2
								width={24}
								height={24}
								className="w-4 h-4 text-green-600"
							/>
							{queryResultNumber}
						</div>
					)}

				{isMakingSqlRequest === false && sqlSqlResultError != null && (
					<div className="text-sm text-red-500 text-center p-2">
						{sqlSqlResultError}
					</div>
				)}

				{sqlSqlResultError === null &&
					isMakingSqlRequest === false &&
					Array.isArray(sqlResult) &&
					sqlResult.length > 0 && (
						<div className="overflow-auto border rounded p-2 max-h-96">
							<pre>{JSON.stringify(sqlResult, null, 2)}</pre>
						</div>
					)}

				<div>
					<form
						id="queryForm"
						ref={queryFormRef}
						method="post"
						onSubmit={handleSubmit}
					>
						<Textarea
							ref={queryTextAreaRef}
							name="query"
							value={query}
							onChange={handleQueryChange}
							onKeyDown={handleTextAreaKeyDown}
							onFocus={handleTextAreaFocus}
							placeholder="SELECT * FROM table_name LIMIT 10"
						/>
					</form>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						form="queryForm"
						type="submit"
						disabled={isMakingSqlRequest}
						title="Run"
					>
						{isMakingSqlRequest ? "Loading..." : ""}
						&nbsp;
						<FanIcon
							width={24}
							height={24}
							className={isMakingSqlRequest ? "animate-spin" : undefined}
						/>
					</Button>
				</DialogFooter>
			</>
		);

		function handleSubmit(e) {
			e.preventDefault();

			setIsMakingSqlRequest(true);

			const formElement =
				e.target instanceof HTMLFormElement ? e.target : queryFormRef.current;
			const formData = new FormData(formElement);

			const urlParams = new URLSearchParams(window.location.search);

			if (!db_id) return console.error("no db_id present");

			formData.set("db_id", db_id);

			setTimeout(async () => {
				try {
					const result = await executeRawSqlQuery(formData);
					console.debug({ result });

					if (!result.ok) {
						setSqlResultError(result.message);
						setIsMakingSqlRequest(false);
						return;
					}
					setSqlResultError(null);
					setSqlResult(result.data);

					console.log(
						`${ROOT_URL}/api/get-table-rows?db_id=${db_id}&table_name=${table_name}&search=${search}&search_by=${search_by}`,
					);
					await mutate(
						`${ROOT_URL}/api/get-table-rows?db_id=${db_id}&table_name=${table_name}&search=${search}&search_by=${search_by}`,
					);

					const suffix = result.data.length === 1 ? "result" : "results";
					setQueryResultNumber(`Returned ${result.data.length} ${suffix}`);
					setIsMakingSqlRequest(false);
				} catch (error) {
					console.error(error);
					setSqlResultError(error);
					setIsMakingSqlRequest(false);
				}
			}, 100);
		}

		function handleTextAreaKeyDown(e) {
			if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				e.stopPropagation();
				handleSubmit(new Event("submit", { target: queryFormRef.current }));
			}
		}

		function handleQueryChange(e) {
			setQuery(e.target.value);
		}

		function handleTextAreaFocus(e) {
			const text_area = e.target;

			text_area.selectionStart = text_area.selectionEnd =
				text_area.value.length;
		}
	}

	function AiModeScreen() {
		const [query, setQuery] = React.useState("");
		const [isMakingAiRequest, setIsMakingAiRequest] = React.useState(false);
		const [aiResponse, setAiResponse] = React.useState();
		const queryFormRef = useRef(null);
		const queryTextAreaRef = useRef(null);

		const SESSION_STORAGE_KEY = "ai_mode_screen";
		const SESSION_STORAGE_QUERY_KEY = `${SESSION_STORAGE_KEY}_query`;
		const SESSION_STORAGE_AI_RESPONSE = `${SESSION_STORAGE_KEY}_ai_response`;

		useEffect(() => {
			const savedQuery = localStorage.getItem(SESSION_STORAGE_QUERY_KEY);
			if (savedQuery) {
				setQuery(savedQuery);
			}

			const savedResponse = localStorage.getItem(SESSION_STORAGE_AI_RESPONSE);
			if (savedResponse) {
				setAiResponse(JSON.parse(savedResponse));
			}
		}, []);

		useEffect(() => {
			if (isGodModeOpen) {
				queryTextAreaRef.current.focus();
			}
		}, [isGodModeOpen]);

		useEffect(() => {
			// TODO: throttle or debounce so we're not using too many calls!
			localStorage.setItem(SESSION_STORAGE_QUERY_KEY, query);
		}, [query]);

		useEffect(() => {
			if (aiResponse == undefined) return;
			localStorage.setItem(
				SESSION_STORAGE_AI_RESPONSE,
				JSON.stringify(aiResponse),
			);
		}, [aiResponse]);

		const parsedMarkdown = useMemo(() => {
			if (aiResponse?.choices?.length > 0) {
				return marked.parse(aiResponse.choices[0]?.message?.content);
			}
			return "";
		}, [aiResponse]);

		return (
			<>
				<DialogHeader>
					{/* <DialogTitle>AI mode</DialogTitle> */}
					<DialogDescription className="mt-4 text-md sm:text-xl text-foreground">
						Talk to your database in natural language
					</DialogDescription>
				</DialogHeader>

				{isMakingAiRequest == false && aiResponse?.choices?.length > 0 && (
					<div className="overflow-auto border rounded p-2 max-h-96">
						<div
							dangerouslySetInnerHTML={{ __html: parsedMarkdown }}
							className="prose prose-p:text-foreground"
						></div>
					</div>
				)}

				<div>
					<form
						id="queryForm"
						ref={queryFormRef}
						method="post"
						onSubmit={handleSubmit}
					>
						<Textarea
							ref={queryTextAreaRef}
							name="query"
							value={query}
							onChange={handleQueryChange}
							onKeyDown={handleTextAreaKeyDown}
							onFocus={handleTextAreaFocus}
							placeholder="How do I Sqlite?"
						/>
					</form>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						form="queryForm"
						type="submit"
						disabled={isMakingAiRequest}
						title={isMakingAiRequest ? "Running" : "Run"}
					>
						{isMakingAiRequest ? "Loading..." : ""}
						&nbsp;
						<StarsIcon
							width={24}
							height={24}
							className={
								isMakingAiRequest ? "animate-pulse text-cyan-400" : undefined
							}
						/>
					</Button>
				</DialogFooter>
			</>
		);

		function handleSubmit(e) {
			e.preventDefault();

			setIsMakingAiRequest(true);

			const formElement =
				e.target instanceof HTMLFormElement ? e.target : queryFormRef.current;

			const formData = new FormData(formElement);

			const urlParams = new URLSearchParams(window.location.search);

			const db_id = urlParams.get("db_id") ?? null;

			if (!db_id) return console.error("no db_id present");

			formData.set("db_id", db_id);

			// if we have a table is visible let's send the context as well
			const table_name = urlParams.get("table");
			if (table_name && table_name != "")
				formData.set("table_name", table_name);

			const payload = Object.fromEntries(formData);
			console.log(payload);

			makeChatGptRequest(payload)
				.then((res) => {
					res.json().then((result) => {
						console.log(result);
						setAiResponse(result);
					});
				})
				.catch((err) => {
					console.log("failed to make gpt request: ", err);
				})
				.finally(() => {
					setIsMakingAiRequest(false);
				});
		}

		function handleTextAreaKeyDown(e) {
			if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				e.stopPropagation();
				handleSubmit(new Event("submit", { target: queryFormRef.current }));
			}
		}

		function handleQueryChange(e) {
			setQuery(e.target.value);
		}

		function handleTextAreaFocus(e) {
			const text_area = e.target;

			text_area.selectionStart = text_area.selectionEnd =
				text_area.value.length;
		}
	}
}
