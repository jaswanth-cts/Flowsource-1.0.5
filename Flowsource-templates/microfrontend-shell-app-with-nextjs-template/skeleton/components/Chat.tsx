import React from "react";

import { useFlag } from "@unleash/nextjs";

export default function Chat() {
	const isChatEnabled = useFlag("enable-chat");

	if (!isChatEnabled) {
		return null;
	}

	return (
		<button
			className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
			style={{
				position: "fixed",
				bottom: "200px",
				right: "50px",
				zIndex: 1000,
				width: "60px",
				height: "60px",
			}}
		>
			Chat!
		</button>
	);
}

