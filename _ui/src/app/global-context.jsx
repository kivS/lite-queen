"use client";

import React, { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export function useGlobal() {
	return useContext(GlobalContext);
}

export const GlobalProvider = ({ children }) => {
	const [isGodModeOpen, setGodModeOpen] = useState(false);
	const [godModeCurrentScreen, setGodModeCurrentScreen] =
		useState("go_anywhere");

	const value = {
		// States
		isGodModeOpen,
		godModeCurrentScreen,

		// Actions
		setGodModeOpen,
		setGodModeCurrentScreen,
	};

	return (
		<GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
	);
};
