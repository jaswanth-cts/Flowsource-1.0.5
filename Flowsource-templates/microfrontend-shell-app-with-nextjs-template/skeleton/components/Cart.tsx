import { useFlag } from "@unleash/nextjs";
import Link from "next/link";
import React from "react";

const Cart = () => {
	const isCartEnabled = useFlag("show-cart");
	if (isCartEnabled) {
		return (
			<Link className="nav-link" href="#">
				Cart
			</Link>
		);
	}
};

export default Cart;
