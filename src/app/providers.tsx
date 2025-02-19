"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
	token: string | null;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
	token: null,
	isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const response = await fetch("/api/token");
				if (response.status === 200) {
					const data = await response.json();
					setToken(data.token);
				}
			} catch (error) {
				console.error("Failed to fetch token:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchToken();
	}, []);

	return (
		<AuthContext.Provider value={{ token, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ThemeProvider attribute="class" disableTransitionOnChange enableSystem>
			<AuthProvider>
				{children}
				<Toaster />
			</AuthProvider>
		</ThemeProvider>
	);
}

export function Toaster() {
	const { resolvedTheme } = useTheme();

	if (!resolvedTheme) return null;

	return (
		<Sonner richColors theme={resolvedTheme === "dark" ? "dark" : "light"} />
	);
}
