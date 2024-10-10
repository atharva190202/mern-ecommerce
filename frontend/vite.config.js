import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:5000",
			},
		},
	},
});
/*proxy: { "/api": { target: "http://localhost:5000", ... } }
The proxy option is used to redirect API requests made from the frontend during development to another server. Here's how it works:

"/api": This means that any requests that start with /api will be proxied.
target: "http://localhost:5000": This is the target where the requests will be forwarded. In this case, it’s a backend server running on http://localhost:5000*/
