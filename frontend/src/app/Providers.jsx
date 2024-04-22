import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/features/store";

function Providers({ children }) {
	return /*#__PURE__*/ React.createElement(
		Provider,
		{
			store: store
		},
		children
	);
}

export default Providers;
