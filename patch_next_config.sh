sed -i 's/remotePatterns: \[/remotePatterns: \[\n      \{\n        protocol: "https",\n        hostname: "**",\n        port: "",\n        pathname: "\/\*\*"\n      \},/' next.config.ts
