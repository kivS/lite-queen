import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "./footer";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { GlobalProvider } from "./global-context";
import SwrConfigGlobal from "./swr-global-config";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className + " min-h-dvh flex flex-col"}>
				<SwrConfigGlobal>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<GlobalProvider>
							{children}
							<Toaster />
							<Footer />
							<TailwindIndicator />
						</GlobalProvider>
					</ThemeProvider>
				</SwrConfigGlobal>
			</body>
		</html>
	);
}
