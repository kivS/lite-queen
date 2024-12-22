import { Database } from "bun:sqlite";
import staticFiles from "./static-ui-bundle.js";
import { parseArgs } from "node:util";
import { randomUUID } from "node:crypto";
import { $ } from "bun";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const IS_DEV_MODE = process.env.IS_DEV === "true";

type ShortTermMemoryDatabase = {
	db_id: string;
	db_alias: string;
	db_filename: string;
	db_path: string;
	db_size_in_bytes: number;
	db_last_modified: number;
	backups: { timestamp: number; file_name: string; file_location: string }[];
};

type ShortTermMemory = {
	databases: Record<string, ShortTermMemoryDatabase>;
	latest_build_update_datetime: string;
};

let shortTermMemory: ShortTermMemory = {
	databases: {},
	latest_build_update_datetime: "",
};

const default_folder_location = "lite-queen-data";
const LongTermMemoryFileName = "lite-queen_long_term_memory.json";
const backup_folder_location = `${default_folder_location}/backups`;

const { values: flags, positionals } = parseArgs({
	args: Bun.argv,
	options: {
		port: {
			type: "string",
			default: "8000",
		},
		hostname: {
			type: "string",
			default: "localhost",
		},
		data_dir: {
			type: "string",
			default: "",
		},
		help: {
			type: "boolean",
		},
	},
	strict: true,
	allowPositionals: true,
});

if (flags?.help) {
	console.log(`
Usage: lite-queen [options]

Options:
  --port <port>         Specify the port to run the server (default: 8000)
  --hostname <hostname> Specify the hostname (default: hostname)
  --data_dir <data_dir> Specify the data directory (default: data-dir)
  --help                Show help information
`);
	process.exit(0);
}

process.on("SIGINT", async () => {
	console.log("\nSIGINT! Lite Queen shutting down...");

	await saveToLongTermMemory(shortTermMemory, flags.data_dir || "");
	process.exit();
});

loadLongTermMemory(flags.data_dir).then((data) => {
	if (data) {
		shortTermMemory = data;
	}
});

const server = Bun.serve({
	async fetch(req) {
		const url = new URL(req.url);

		let defaultHeaders = {};

		if (IS_DEV_MODE) {
			defaultHeaders = {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Allowed methods
				"Access-Control-Allow-Headers":
					"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization",
			};
		}

		/**
		 *
		 *  Json response with headers already set for cors and whatnot
		 *
		 * @param data
		 * @param status
		 * @returns
		 */
		function json_response(data, status = 200) {
			return Response.json(data, {
				status: status,
				headers: { ...defaultHeaders },
			});
		}

		if (IS_DEV_MODE) {
			console.debug({ href: url.href });
		}

		// ***********************
		//* 		ROUTES

		// Handle preflight requests
		if (req.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: defaultHeaders,
			});
		}

		if (req.method === "GET" && url.pathname === "/api/get-loaded-databases") {
			return Response.json(
				{ databases: shortTermMemory.databases },
				{ headers: { ...defaultHeaders } },
			);
		}
		if (req.method === "POST" && url.pathname === "/api/load-database") {
			const formData = await req.formData();

			const db_path = formData.get("db_path");
			const db_alias = formData.get("db_alias");

			const file = Bun.file(db_path);
			const file_exists = await file.exists();

			if (!file_exists) {
				return Response.json(
					{
						ok: false,
						message: `[ ${db_path} ] does not exist`,
					},
					{ headers: { ...defaultHeaders } },
				);
			}

			// check if we can connect to the database
			try {
				const db = new Database(db_path?.toString());
				const q = db.query("PRAGMA journal_mode").get();
				db.close();
			} catch (error) {
				console.log(error?.message);
				return Response.json(
					{
						ok: false,
						message: "Failed to connect",
						context: error.message,
					},
					{ headers: { ...defaultHeaders } },
				);
			}

			const db_id = new Bun.CryptoHasher("ripemd160")
				.update(db_path as string)
				.digest("hex");

			const db_filename = file.name?.split("/").pop();

			shortTermMemory.databases[db_id] = {
				db_id,
				db_alias,
				db_filename,
				db_path,
				db_size_in_bytes: file.size,
				db_last_modified: file.lastModified,
			};

			console.debug({ shortTermMemory });

			return Response.json(
				{
					ok: true,
					message: "Database loaded sucessfuly!",
					data: {
						db_id,
						db_alias,
						db_filename,
						db_path,
					},
				},
				{ headers: { ...defaultHeaders } },
			);
		}
		if (req.method === "GET" && url.pathname === "/api/get-database-info") {
			const db_id = url.searchParams.get("db_id");

			if (!db_id) {
				return Response.json(
					{ ok: false, message: "db_id is missing" },
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}
			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				const query = db.query(
					"SELECT name FROM sqlite_master WHERE type='table';",
				);

				const tables = query.all().map((table) => table.name);

				const fks = {};
				for (const table of tables) {
					const query = db.query(`PRAGMA foreign_key_list('${table}');`).all();

					// console.log(query);

					if (query !== null) {
						fks[table] = query;
					}
				}
				// console.log({ fks });

				// schema/indexes/triggers/ for all tables
				// Query to get all schema information from sqlite_master
				const schema_query =
					"SELECT type, name, tbl_name, sql FROM sqlite_master";
				const rows = db.query(schema_query).all();

				// Initialize an object to hold the formatted schema
				const schemas = {};

				// Process each row
				for (const row of rows) {
					const { type, name, tbl_name, sql } = row;

					if (!schemas[tbl_name]) {
						// If the table name isn't in the object, add it with an empty object
						schemas[tbl_name] = {};
					}

					if (!schemas[tbl_name][type]) {
						// If the type (e.g., 'table', 'index', 'trigger') isn't in the table object, add it with an empty array
						schemas[tbl_name][type] = [];
					}

					// Add the row to the appropriate array based on its type
					schemas[tbl_name][type].push({
						type,
						name,
						tbl_name,
						sql,
					});
				}

				db.close(false);

				return Response.json(
					{
						ok: true,
						db_alias: shortTermMemoryDatabase.db_alias,
						foreign_keys: fks,
						tables,
						schemas,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				db?.close();

				return Response.json(
					{
						ok: false,
						message: "Failed to get database info",
						context: error?.message,
					},
					{ headers: { ...defaultHeaders } },
				);
			}
		}
		if (
			req.method === "POST" &&
			url.pathname === "/api/update-database-settings"
		) {
			const formData = await req.formData();

			const db_path = formData.get("db_path");
			const db_alias = formData.get("db_alias");
			const db_id = formData.get("db_id");

			if (!db_path || !db_alias || !db_id) {
				return Response.json(
					{
						ok: false,
						message: "Missing required fields: db_path, db_alias, or db_id",
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}

			const shortTermMemoryDatabase =
				shortTermMemory.databases[db_id.toString()];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			if (
				db_alias === shortTermMemoryDatabase.db_alias &&
				db_path === shortTermMemoryDatabase.db_path
			) {
				return Response.json(
					{
						ok: false,
						message: "No changes detected",
					},
					{ headers: { ...defaultHeaders } },
				);
			}

			// on dbPath change is new, check if the file exists and then update the DbPath and DbFilename on shortmemory
			if (db_path !== shortTermMemoryDatabase.db_path) {
				try {
					const file = Bun.file(db_path.toString());

					if (!(await file.exists())) {
						return Response.json(
							{
								ok: false,
								message: `DB file [ ${db_path} ] does not exist`,
							},
							{ status: 400, headers: { ...defaultHeaders } },
						);
					}

					const db_filename = file.name;

					shortTermMemory.databases[db_id.toString()] = {
						...shortTermMemoryDatabase,
						db_path,
						db_filename,
					};

					await saveToLongTermMemory(shortTermMemory, flags?.data_dir || "");

					return Response.json(
						{
							ok: true,
							message: "db path updated!",
						},
						{ headers: { ...defaultHeaders } },
					);
				} catch (error) {
					return Response.json(
						{
							ok: false,
							message: error?.message,
						},
						{ status: 400, headers: { ...defaultHeaders } },
					);
				}
			}

			if (db_alias !== shortTermMemoryDatabase.db_alias) {
				shortTermMemory.databases[db_id.toString()] = {
					...shortTermMemoryDatabase,
					db_alias,
				};

				await saveToLongTermMemory(shortTermMemory, flags?.data_dir || "");

				return Response.json(
					{
						ok: true,
						message: "database alias updated!",
					},
					{ headers: { ...defaultHeaders } },
				);
			}
		}
		if (req.method === "DELETE" && url.pathname === "/api/delete-database") {
			const db_id = url.searchParams.get("db_id");

			if (!db_id || !shortTermMemory.databases[db_id.toString()]) {
				return Response.json(
					{
						ok: false,
						message: "Database not found",
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}

			delete shortTermMemory.databases[db_id];

			return Response.json(
				{
					ok: true,
					message: "Database deleted",
				},
				{ headers: { ...defaultHeaders } },
			);
		}

		if (req.method === "POST" && url.pathname === "/api/backup-database") {
			const formData = await req.formData();

			const db_id = formData.get("db_id");

			if (!db_id || !shortTermMemory.databases[db_id.toString()]) {
				return Response.json(
					{
						ok: false,
						message: "Database not found",
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}

			const shortTermMemoryDatabase =
				shortTermMemory.databases[db_id.toString()];

			// detect if sqlite3 is present
			try {
				const output = await $`sqlite3 --version`.text();
			} catch (error) {
				return Response.json(
					{
						ok: false,
						message: "sqlite3 is not present. Install it first.",
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}

			const backup_location = `${flags.data_dir === "" ? backup_folder_location : flags.data_dir}/${shortTermMemoryDatabase.db_id.toString()}`;
			const backup_file = `${Date.now()}_backup.db`;

			try {
				await mkdir(backup_location, {
					recursive: true,
				});

				const result =
					await $`sqlite3 ${shortTermMemoryDatabase.db_path}  ".backup ${backup_location}/${backup_file}`;
			} catch (error) {
				console.error(error);
				return Response.json(
					{
						ok: false,
						message: "Failed to create backup",
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}

			if (!shortTermMemory.databases[db_id.toString()].backups) {
				shortTermMemory.databases[db_id.toString()].backups = [];
			}

			shortTermMemory.databases[db_id.toString()].backups.push({
				timestamp: Date.now(),
				file_name: backup_file,
				file_location: `${backup_location}/${backup_file}`,
			});

			// not so fast man
			Bun.sleepSync(1000);

			return Response.json(
				{
					ok: true,
				},
				{ headers: { ...defaultHeaders } },
			);
		}

		if (req.method === "GET" && url.pathname === "/api/database-backups") {
			const db_id = url.searchParams.get("db_id") || "";

			if (!shortTermMemory.databases[db_id]) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			const backups =
				shortTermMemory.databases[db_id]?.backups?.reverse() || [];

			return Response.json(
				{
					ok: true,
					backups,
				},
				{ headers: { ...defaultHeaders } },
			);
		}

		if (req.method === "GET" && url.pathname === "/api/download-backup") {
			const db_id = url.searchParams.get("db_id") || "";
			const backup_file_name = url.searchParams.get("file_name") || "";

			if (!shortTermMemory.databases[db_id]) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			const backups = shortTermMemory.databases[db_id]?.backups || [];
			const backup = backups.find((b) => b.file_name === backup_file_name);

			if (!backup) {
				return Response.json(
					{ ok: false, message: "Backup file not found" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			const file = Bun.file(backup.file_location);

			const fileExists = await file.exists();

			if (!fileExists) {
				return Response.json(
					{ ok: false, message: "Backup file does not exist on server" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			return new Response(file.stream(), {
				headers: {
					"Content-Type": "application/octet-stream",
					"Content-Disposition": `attachment; filename="${shortTermMemory.databases[db_id]?.db_filename.toLowerCase()}_${backup_file_name}"`,
					...defaultHeaders,
				},
			});
		}

		// =========================

		if (req.method === "GET" && url.pathname === "/api/get-table-info") {
			// console.debug(Object.fromEntries(url.searchParams.entries()));

			const db_id = url.searchParams.get("db_id") || "";
			const table_name = url.searchParams.get("table_name");

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				const table_info = db.query(`PRAGMA table_info(${table_name})`).all();

				db.close(false);

				return Response.json(
					{
						ok: true,
						table_info,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				console.error("Failed to get table info: ", error);
				db?.close(false);
				return Response.json(
					{
						ok: false,
					},
					{ headers: { ...defaultHeaders } },
				);
			}
		}

		if (req.method === "GET" && url.pathname === "/api/get-table-rows") {
			// console.debug(Object.fromEntries(url.searchParams.entries()));

			const db_id = url.searchParams.get("db_id") || "";
			const table_name = url.searchParams.get("table_name");
			const search = url.searchParams.get("search");
			const search_by = url.searchParams.get("search_by");
			const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
			const limit = Number.parseInt(url.searchParams.get("limit") || "50", 10);

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				let search_query = `SELECT * FROM ${table_name}`;
				if (search && search_by) {
					const searchFields = search_by.split(",");
					const searchConditions = searchFields.map(
						(field) => `${field} LIKE '%${search}%'`,
					);
					const searchCondition = searchConditions.join(" OR ");
					search_query += ` WHERE ${searchCondition}`;
				}

				// add pagination to the query
				const offset = (page - 1) * limit;
				search_query += ` LIMIT ${limit} OFFSET ${offset}`;

				IS_DEV_MODE && console.debug({ search_query });

				const rows = db.query(search_query).all();

				db.close(false);

				return Response.json(
					{
						ok: true,
						rows,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				console.error("Failed to get table rows: ", error);
				db?.close(false);
				return Response.json(
					{
						ok: false,
					},
					{ headers: { ...defaultHeaders } },
				);
			}
		}
		if (req.method === "GET" && url.pathname === "/api/get-table-row") {
			const db_id = url.searchParams.get("db_id") || "";
			const table = url.searchParams.get("table");
			const field = url.searchParams.get("field");
			const value = url.searchParams.get("value");

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				const db_query = db
					.query(`SELECT * FROM ${table} WHERE ${field} = ? LIMIT 1`)
					.get(value);

				db.close(false);

				return Response.json(
					{
						ok: true,
						data: db_query,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				console.error("Failed to get table rows: ", error);
				db?.close(false);
				return Response.json(
					{
						ok: false,
						message: error?.message,
					},
					{ headers: { ...defaultHeaders } },
				);
			}
		}
		if (req.method === "GET" && url.pathname === "/api/get-table-row-count") {
			// console.debug(Object.fromEntries(url.searchParams.entries()));

			const db_id = url.searchParams.get("db_id") || "";
			const table_name = url.searchParams.get("table_name");
			const search = url.searchParams.get("search");
			const search_by = url.searchParams.get("search_by");

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				let db_query = `SELECT count(*) AS count FROM ${table_name}`;
				if (search && search_by) {
					const searchFields = search_by.split(",");
					const searchConditions = searchFields.map(
						(field) => `${field} LIKE '%${search}%'`,
					);
					const searchCondition = searchConditions.join(" OR ");
					db_query += ` WHERE ${searchCondition}`;
				}

				const count_q = db.query(db_query).get();

				db.close(false);

				return Response.json(
					{
						ok: true,
						count: count_q.count,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				console.error("Failed to get table row count ", error);
				db?.close();
				return Response.json(
					{
						ok: false,
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}
		}
		if (req.method === "POST" && url.pathname === "/api/add-table-row") {
			const formData = await req.formData();
			const db_id = url.searchParams.get("db_id") || "";
			const table_name = url.searchParams.get("table_name");

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				const columns = [];
				const values = [];
				for (const [key, value] of formData) {
					columns.push(key);
					values.push(value);
				}

				const query = db.prepare(
					`INSERT INTO ${table_name} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
				);

				let result;
				db.transaction((vals) => {
					result = query.run(vals);
				}).immediate(values);

				db.close(false);

				if (result?.changes !== 1) {
					return Response.json(
						{
							ok: false,
							message:
								"Failed to add record in database. Query made no changes!",
						},
						{ headers: { ...defaultHeaders } },
					);
				}

				return Response.json(
					{
						ok: true,
						data: {
							lastInsertRowid: result.lastInsertRowid,
						},
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				console.debug(error);
				db?.close(false);
				return Response.json(
					{
						ok: false,
						message: error?.message,
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}
		}
		if (req.method === "POST" && url.pathname === "/api/update-table-row") {
			const payload = await req.json();

			console.debug({ payload });

			const shortTermMemoryDatabase = shortTermMemory.databases[payload.db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				const convertToType = (value, columnType) => {
					switch (columnType) {
						case "INTEGER":
							return Number.parseInt(value, 10);
						case "REAL":
							return Number.parseFloat(value);
						case "TEXT":
							return value;
						case "BLOB":
							return Buffer.from(value);
						default:
							return value;
					}
				};

				const updateStatements = [];
				const values = [];

				for (const [field, value] of Object.entries(payload.fields_to_update)) {
					const columnInfo = payload.table_info.find(
						(col) => col.name === field,
					);
					const columnType = columnInfo ? columnInfo.type : "TEXT";
					const convertedValue = convertToType(value, columnType);

					updateStatements.push(`"${field}" = ?`);

					if (value === "") {
						values.push(null);
						continue;
					}

					values.push(convertedValue);
				}

				const updateQuery = updateStatements.join(", ");

				let whereQuery = "";
				const primaryKeyField = payload.table_info.find(
					(col) => col.pk === 1,
				)?.name;

				if (primaryKeyField) {
					whereQuery = `"${primaryKeyField}" = ?`;
					values.push(payload.original_row_data[primaryKeyField]);
				} else {
					const whereStatements = [];
					for (const [field, value] of Object.entries(
						payload.original_row_data,
					)) {
						if (value === null) {
							whereStatements.push(`"${field}" IS NULL`);
						} else {
							whereStatements.push(`"${field}" = ?`);
							values.push(value);
						}
					}
					whereQuery = whereStatements.join(" AND ");
				}

				const sqlQuery = `UPDATE ${payload.table_name} SET ${updateQuery} WHERE ${whereQuery};`;

				const stmt = db.prepare(sqlQuery);

				let result;
				db.transaction((vals) => {
					result = stmt.run(vals);
				}).immediate(values);

				db.close(false);

				if (result?.changes !== 1) {
					return Response.json(
						{
							ok: false,
							message: "Failed to update record. Query made no changes!",
						},
						{ headers: { ...defaultHeaders } },
					);
				}

				return Response.json(
					{
						ok: true,
						message: "Row updated sucessfully!",
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				db?.close(false);
				return Response.json(
					{
						ok: false,
						message: error.message,
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}
		}
		if (req.method === "GET" && url.pathname === "/api/get-table-columns") {
			const db_id = url.searchParams.get("db_id") || "";
			const table = url.searchParams.get("table");

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				const table_info = db.query(`PRAGMA table_info(${table})`).all();

				db.close(false);

				return Response.json(
					{
						ok: true,
						data: table_info,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				console.error("Failed to get table columns ", error);
				db?.close(false);
				return Response.json(
					{
						ok: false,
						message: error?.message,
					},
					{ status: 400, headers: { ...defaultHeaders } },
				);
			}
		}
		if (req.method === "DELETE" && url.pathname === "/api/delete-table-row") {
			const db_id = url.searchParams.get("db_id") || "";
			const table_name = url.searchParams.get("table_name");
			const field_id = url.searchParams.get("field_id");
			const field_value = url.searchParams.get("field_value");

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				const query = db.prepare(
					`DELETE FROM ${table_name} WHERE ${field_id} = ?`,
				);

				let result;
				db.transaction(() => {
					result = query.run(field_value);
				}).immediate();

				db.close(false);

				if (result?.changes === 0) {
					return Response.json(
						{
							ok: false,
							message: "Failed to delete record",
						},
						{ status: 400, headers: { ...defaultHeaders } },
					);
				}

				return Response.json(
					{
						ok: true,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				db?.close(false);
				return Response.json(
					{
						ok: false,
						message: error.message,
					},
					{ headers: { ...defaultHeaders } },
				);
			}
		}

		if (
			req.method === "POST" &&
			url.pathname === "/api/execute-raw-sql-query"
		) {
			const formData = await req.formData();

			const db_id = formData.get("db_id");
			const query = formData.get("query");

			const shortTermMemoryDatabase = shortTermMemory.databases[db_id];

			if (!shortTermMemoryDatabase) {
				return Response.json(
					{ ok: false, message: "Database not found in memory" },
					{ status: 404, headers: { ...defaultHeaders } },
				);
			}

			let db: Database | null = null;

			try {
				db = getWriteDb(shortTermMemoryDatabase.db_path);

				let result;
				const queryString = query.toString().trim().toLowerCase();
				if (
					queryString.includes("update") ||
					queryString.includes("insert") ||
					queryString.includes("delete")
				) {
					result = db.run(query);
				} else {
					result = db.query(query).all();
				}

				db.close(false);

				return Response.json(
					{
						ok: true,
						data: result?.changes ? [] : result,
					},
					{ headers: { ...defaultHeaders } },
				);
			} catch (error) {
				db?.close(false);
				return Response.json(
					{
						ok: false,
						message: error.message,
					},
					{ headers: { ...defaultHeaders } },
				);
			}
		}

		if (req.method === "GET" && url.pathname === "/api/get-build-info") {
			const build_date = process.env.BUILD_DATE;

			return json_response({
				ok: true,
				latest_build_update_datetime: build_date,
			});
		}

		// ***********************

		// load static files from the bundle
		let path = url.pathname.slice(1); // Remove leading slash

		if (path === "") path = "index.html";
		if (path === "db/") path = "db/index.html";
		if (path === "db/tables/") path = "db/tables/index.html";

		if (IS_DEV_MODE) {
			console.debug({ sliced_path: path });
		}

		if (path in staticFiles) {
			const contentType = getContentType(path);
			// console.log(`${path} - contentType: ${contentType}`);

			const headers = { "Content-Type": contentType };

			if (path.startsWith("_next/static/")) {
				headers["Cache-Control"] =
					"max-age=604800, stale-while-revalidate=86400";
			}

			return new Response(staticFiles[path], {
				headers,
			});
		}

		return new Response("nope", {
			status: 404,
			headers: { ...defaultHeaders },
		});
	},
	port: flags.port,
	hostname: flags.hostname,
});

if (process.env.BUILD_DATE) {
	const build_date = process.env.BUILD_DATE;
	console.debug(`\n[ Latest update on ${build_date} ]`);
}

if (IS_DEV_MODE) {
	console.log("\n[ Running in dev mode ]");
}

console.debug(`\n[ Lite Queen running on ${server.url.href} ]`);

//****************************************************************************************

async function saveToLongTermMemory(shortTermMemory, data_dir: string) {
	console.debug("Storing data to longTermMemory...");

	try {
		const jsonResponse = JSON.stringify(shortTermMemory);

		let longTermMemoryFile: string;

		if (data_dir === "") {
			longTermMemoryFile = `${default_folder_location}/${LongTermMemoryFileName}`;
		} else {
			longTermMemoryFile = `${data_dir}/${LongTermMemoryFileName}`;
		}

		await Bun.write(longTermMemoryFile, jsonResponse);
	} catch (err) {
		console.error("Error storing data: ", err);
	}
}

async function loadLongTermMemory(data_dir: string) {
	let longTermMemoryFile: string;

	if (data_dir === "") {
		longTermMemoryFile = `${default_folder_location}/${LongTermMemoryFileName}`;
	} else {
		longTermMemoryFile = `${data_dir}/${LongTermMemoryFileName}`;
	}

	try {
		const data = Bun.file(longTermMemoryFile);

		if (!(await data.exists())) {
			return null;
		}

		return data.json();
	} catch (err) {
		console.error("Error loading long term memory: ", err);
		return null;
	}
}

function getReadDb(db_path: string) {
	try {
		const db = new Database(db_path, {
			readonly: true,
			strict: true,
		});

		executeDbConnectionPragmas(db);

		return db;
	} catch (error) {
		throw new Error("Failed to get database in read mode: ", error?.message);
	}
}

function getWriteDb(db_path: string) {
	try {
		const db = new Database(db_path, {
			strict: true,
		});

		executeDbConnectionPragmas(db);

		return db;
	} catch (error) {
		throw new Error("Failed to get database in write mode: ", error?.message);
	}
}

function executeDbConnectionPragmas(db: Database) {
	const result = db.run(
		"PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA cache_size = -20000; PRAGMA foreign_keys = true; PRAGMA temp_store = memory; PRAGMA synchronous = FULL;",
	);
}

function getContentType(path: string) {
	const contentTypeMap = {
		".html": "text/html",
		".css": "text/css",
		".js": "application/javascript",
		".png": "image/png",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".gif": "image/gif",
		".svg": "image/svg+xml",
		".txt": "text/plain",
		".json": "application/json",
		".mp3": "audio/mpeg",
		".mp4": "video/mp4",
		".wav": "audio/wav",
		".ogg": "audio/ogg",
		".oga": "audio/ogg",
		".ogv": "video/ogg",
		".webm": "video/webm",
		".webp": "image/webp",
		".pdf": "application/pdf",
		".doc": "application/msword",
		".docx":
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls": "application/vnd.ms-excel",
		".xlsx":
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".ppt": "application/vnd.ms-powerpoint",
		".pptx":
			"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	};

	const extension = path.split(".").pop();
	return contentTypeMap[`.${extension}`] || "application/octet-stream";
}
