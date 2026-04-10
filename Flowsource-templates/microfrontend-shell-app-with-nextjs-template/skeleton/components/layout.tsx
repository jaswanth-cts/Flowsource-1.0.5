import React, { useState } from "react";
import Navbar from './Navbar'
import Footer from './Footer'
import { FlagProvider } from "@unleash/nextjs/client";
import UserInputForm from "./UserInput";
 
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [userId, setUserId] = useState<string | null>(null);
	const [region, setRegion] = useState<string | null>(null);

	// Build Unleash context dynamically
	const unleashContext = {
		...(userId && { userId }),
		properties: {
			...(region && { region }),
		},
	};

	// Render UserInputForm if userId or region is missing
	if (!userId || !region) {
		return (
			<UserInputForm
				onSubmit={(userId, region) => {
					setUserId(userId);
					setRegion(region);
				}}
			/>
		);
	}

	// Render the application once userId and region are provided
	return (
		<FlagProvider
			config={{
				context: unleashContext,
			}}
		>
			<Navbar organizationName="Cognizant Demo" />
			<main>{children}</main>
			<Footer />
		</FlagProvider>
	);
}