import { defineConfig } from "vite";

export default defineConfig({
  server: {
    watch: {
      ignored: ["**/.chrome-audit/**"],
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
              priority: 30,
              includeDependenciesRecursively: false,
            },
            {
              name: "icons-vendor",
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 20,
              includeDependenciesRecursively: false,
            },
            {
              name: "dialect-catalog",
              test: /src[\\/]data[\\/]dialects[\\/].+\.json$/,
              priority: 10,
              includeDependenciesRecursively: false,
              maxSize: 220 * 1024,
            },
            {
              name: "content-catalog",
              test: /src[\\/]data[\\/](meaning-comparisons|region-guides|culture-guides|context-guides)\.json$/,
              priority: 10,
              includeDependenciesRecursively: false,
              maxSize: 180 * 1024,
            },
          ],
        },
      },
    },
  },
});
