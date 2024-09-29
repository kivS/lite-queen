import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import useSWRInfinite from "swr/infinite";

import { ROOT_URL, fetcher } from "./utils";
import { useMemo } from "react";

export function getTableRow(db_id, table, field, value) {
	return useSWR(
		`${ROOT_URL}/api/get-table-row?db_id=${db_id}&table=${table}&field=${field}&value=${value}`,
		fetcher,
	);
}

export async function deleteTableRow(db_id, table_name, field_id, field_value) {
	const request = await fetch(
		`${ROOT_URL}/api/delete-table-row?db_id=${db_id}&table_name=${table_name}&field_id=${field_id}&field_value=${field_value}`,
		{
			method: "DELETE",
		},
	);

	return request.json();
}

export function getTableInfo(db_id, table_name) {
	const url = db_id
		? `${ROOT_URL}/api/get-table-info?db_id=${db_id}&table_name=${table_name}`
		: null;
	return useSWR(url, fetcher);
}

export async function backupDatabase(formData) {
	const request = await fetch(`${ROOT_URL}/api/backup-database`, {
		method: "POST",
		body: formData,
	});

	return request.json();
}

export function getDatabaseBackups(db_id) {
	const url = db_id ? `${ROOT_URL}/api/database-backups?db_id=${db_id}` : null;
	return useSWR(url, fetcher);
}

export function getTableRows(db_id, table_name, search, search_by, limit = 50) {
	const getKey = (pageIndex, previousPageData) => {
		if (previousPageData && !previousPageData.rows?.length) return null;
		return `${ROOT_URL}/api/get-table-rows?db_id=${db_id}&table_name=${table_name}&search=${search}&search_by=${search_by}&page=${pageIndex + 1}&limit=${limit}`;
	};

	const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
		getKey,
		fetcher,
	);

	const rows = useMemo(() => {
		if (!data) return [];
		return data.reduce((acc, page) => {
			if (page.rows) {
				acc.push(...page.rows);
			}
			return acc;
		}, []);
	}, [data]);

	const isLoading = !data && !error;
	const isLoadingMore =
		isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
	const isEmpty = data?.[0]?.rows.length === 0;
	const isReachingEnd =
		isEmpty || (data && data[data.length - 1]?.rows.length < limit);

	return {
		rows,
		error,
		isLoading,
		isLoadingMore,
		isEmpty,
		isReachingEnd,
		size,
		setSize,
		mutate,
	};
}

export function getDatabaseInfo(db_id) {
	const url = db_id ? `${ROOT_URL}/api/get-database-info?db_id=${db_id}` : null;
	return useSWR(url, fetcher);
}

export async function loadDatabase(formData) {
	const request = await fetch(`${ROOT_URL}/api/load-database`, {
		method: "POST",
		body: formData,
	});

	const response = request.json();

	return response;
}

export async function getBuildInfo() {
	return fetch(`${ROOT_URL}/api/get-build-info`).then((res) => res.json());
}

export async function deleteDatabase(db_id) {
	return fetch(`${ROOT_URL}/api/delete-database?db_id=${db_id}`, {
		method: "delete",
	}).then((res) => res.json());
}

export async function updateDatabaseSettings(formData) {
	return fetch(`${ROOT_URL}/api/update-database-settings`, {
		method: "post",
		body: formData,
	}).then((res) => res.json());
}

export function useGetTableRowCount(db_id, table, search, search_by) {
	const url =
		db_id && table
			? `${ROOT_URL}/api/get-table-row-count?db_id=${db_id}&table_name=${table}&search=${search}&search_by=${search_by}`
			: null;
	return useSWR(url, fetcher);
}

export function getTableColumns(db_id, table) {
	const url =
		db_id && table
			? `${ROOT_URL}/api/get-table-columns?db_id=${db_id}&table=${table}`
			: null;
	return useSWR(url, fetcher);
}

export function useGetLoadedDatabases() {
	return useSWR(`${ROOT_URL}/api/get-loaded-databases`, fetcher);
}

export function updateTableRowData(payload) {
	return fetch(`${ROOT_URL}/api/update-table-row`, {
		method: "post",
		body: JSON.stringify(payload),
		headers: {
			"Content-Type": "application/json",
		},
	});
}
export function addRowToTable(db_id, table_name, formData) {
	return fetch(
		`${ROOT_URL}/api/add-table-row?db_id=${db_id}&table_name=${table_name}`,
		{
			method: "post",
			body: formData,
		},
	);
}

/**
 * @param {Object} payload - The payload for the SQL query
 * @param {string} payload.db_id - The id of the database
 * @param {string} payload.query - The query string
 * @returns {Promise<{ok: boolean, message: string, data: Array}>} - The fetch promise with an object inside containing a status and data
 */
export async function executeRawSqlQuery(formData) {
	return fetch(`${ROOT_URL}/api/execute-raw-sql-query`, {
		method: "post",
		body: formData,
	}).then((res) => res.json());
}

export class LocalOpenAiSettings {
	static api_key_storage_key = "openai_api_key";

	static getApiKey() {
		return localStorage.getItem(this.api_key_storage_key);
	}

	static setApiKey(apiKey) {
		localStorage.setItem(this.api_key_storage_key, apiKey);
	}
}

export class AppearanceSettings {
	static local_storage_key = "appearance_settings";
	static windowLabelKey = "window_label";

	static data = {};

	static setWindowLabel(label) {
		this.data[this.windowLabelKey] = label;
		this.save();
	}

	static getWindowLabel() {
		let appearanceSettings = JSON.parse(
			localStorage.getItem(this.local_storage_key),
		);
		return appearanceSettings ? appearanceSettings[this.windowLabelKey] : null;
	}

	static save() {
		let existingData =
			JSON.parse(localStorage.getItem(this.local_storage_key)) || {};
		localStorage.setItem(
			this.local_storage_key,
			JSON.stringify({ ...existingData, ...this.data }),
		);
	}
}

export function makeChatGptRequest(payload) {
	// make sure the api key exists in the db
	let apiKey = LocalOpenAiSettings.getApiKey();
	if (!apiKey) {
		apiKey = prompt(
			"Please enter your OpenAI API key. All data is kept locally on your browser.",
		);
		if (apiKey) {
			LocalOpenAiSettings.setApiKey(apiKey);
		} else {
			return Promise.reject("No API key provided");
		}
	}

	// Test only
	// return new Promise(
	//     (resolve, reject) => {
	//         setTimeout(() => {
	//             resolve({
	//                 json: () => Promise.resolve({
	//                     "choices": [
	//                         {
	//                             "finish_reason": "stop",
	//                             "index": 0,
	//                             "message": {
	//                                 "content": new Date().getTime() + " - You are currently looking at the \"public_holidays\" table.\n\nTo join fields in a SELECT query, you can use the JOIN keyword along with the ON clause to specify the join condition. Here's an example:\n\n```sql\nSELECT *\nFROM table1\nJOIN table2 ON table1.id = table2.id\n```\n\nIn this example, \"table1\" and \"table2\" are the names of the tables you want to join, and \"id\" is the common column between them. You can replace \"table1\" and \"table2\" with the actual table names you want to join, and \"id\" with the actual column name you want to join on. \n\n\n\nYou are currently looking at the \"public_holidays\" table.\n\nTo join fields in a SELECT query, you can use the JOIN keyword along with the ON clause to specify the join condition. Here's an example:\n\n```sql\nSELECT *\nFROM table1\nJOIN table2 ON table1.id = table2.id\n```\n\nIn this example, \"table1\" and \"table2\" are the names of the tables you want to join, and \"id\" is the common column between them. You can replace \"table1\" and \"table2\" with the actual table names you want to join, and \"id\" with the actual column name you want to join on.\n\n\nYou are currently looking at the \"public_holidays\" table.\n\nTo join fields in a SELECT query, you can use the JOIN keyword along with the ON clause to specify the join condition. Here's an example:\n\n```sql\nSELECT *\nFROM table1\nJOIN table2 ON table1.id = table2.id\n```\n\nIn this example, \"table1\" and \"table2\" are the names of the tables you want to join, and \"id\" is the common column between them. You can replace \"table1\" and \"table2\" with the actual table names you want to join, and \"id\" with the actual column name you want to join on. \n\n\n\nYou are currently looking at the \"public_holidays\" table.\n\nTo join fields in a SELECT query, you can use the JOIN keyword along with the ON clause to specify the join condition. Here's an example:\n\n```sql\nSELECT *\nFROM table1\nJOIN table2 ON table1.id = table2.id\n```\n\nIn this example, \"table1\" and \"table2\" are the names of the tables you want to join, and \"id\" is the common column between them. You can replace \"table1\" and \"table2\" with the actual table names you want to join, and \"id\" with the actual column name you want to join on.",
	//                                 "role": "assistant"
	//                             }
	//                         }
	//                     ],
	//                     "created": new Date().getTime(),
	//                     "id": "chatcmpl-8kPmRond0FoqaZd6JfKiGj2fjKjc1",
	//                     "usage": {
	//                         "completion_tokens": 138,
	//                         "prompt_tokens": 273,
	//                         "total_tokens": 411
	//                     }
	//                 })
	//             })
	//         }, 3000);

	//     })

	return fetch(`${ROOT_URL}/api/make-chatgpt-request`, {
		method: "post",
		body: JSON.stringify({ ...payload, api_key: apiKey }),
		headers: {
			"Content-Type": "application/json",
		},
	});
}
