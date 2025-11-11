import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, "../src/routes");
const outFile = path.join(__dirname, "../src/routeTree.gen.ts");

interface RouteInfo {
  filePath: string;
  routeId: string;
  routePath: string;
  fullPath: string;
  importName: string;
  routeName: string;
}

function toPascalCase(str: string): string {
  return str
    .split(/[\/_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function getRouteInfo(filePath: string, routesDir: string): RouteInfo | null {
  const relativePath = path.relative(routesDir, filePath);
  const routeId =
    "/" + relativePath.replace(/\\/g, "/").replace(/\.(tsx|ts)$/, "");

  // Skip __root
  if (routeId === "/__root") {
    return null;
  }

  // Handle index routes
  let finalRouteId = routeId;
  if (routeId.endsWith("/index")) {
    if (routeId === "/index") {
      finalRouteId = "/";
    } else {
      finalRouteId = routeId.replace("/index", "");
    }
  }

  // Calculate route path (remove _ prefix from segments, but keep structure)
  const pathSegments = finalRouteId.split("/").filter(Boolean);
  const routePathSegments = pathSegments.map((seg) => {
    if (seg.startsWith("_")) {
      return seg.slice(1);
    }
    return seg;
  });

  let routePath = "/" + routePathSegments.join("/");
  if (routePath === "/") {
    routePath = "/";
  } else if (
    routePathSegments.length > 0 &&
    routePathSegments[routePathSegments.length - 1] === "index"
  ) {
    routePath = routePath.replace("/index", "");
    if (routePath === "") {
      routePath = "/";
    } else if (!routePath.endsWith("/")) {
      routePath += "/";
    }
  }

  // Full path is the same as route path
  const fullPath = routePath;

  // Generate import path
  const importPath =
    "./routes/" + relativePath.replace(/\\/g, "/").replace(/\.(tsx|ts)$/, "");

  // Generate route name (PascalCase without special chars)
  const routeNameParts = relativePath
    .replace(/\.(tsx|ts)$/, "")
    .split(/[\/\\]/)
    .filter(Boolean)
    .map((part) => {
      // Remove _ prefix for naming
      const clean = part.startsWith("_") ? part.slice(1) : part;
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    });

  let routeName = routeNameParts.join("") + "Route";
  if (routeName === "IndexRoute") {
    routeName = "IndexRoute";
  }

  const importName = routeName + "Import";

  return {
    filePath: importPath,
    routeId: finalRouteId,
    routePath,
    fullPath,
    importName,
    routeName,
  };
}

function scanRoutes(dir: string, routesDir: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      routes.push(...scanRoutes(fullPath, routesDir));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      const routeInfo = getRouteInfo(fullPath, routesDir);
      if (routeInfo) {
        routes.push(routeInfo);
      }
    }
  }

  return routes;
}

function generateRouteTree(): void {
  const routes = scanRoutes(routesDir, routesDir);

  // Sort routes: index first, then others
  routes.sort((a, b) => {
    if (a.routeId === "/") return -1;
    if (b.routeId === "/") return 1;
    return a.routeId.localeCompare(b.routeId);
  });

  // Generate imports
  const imports = routes
    .map(
      (route) =>
        `import { Route as ${route.importName} } from "${route.filePath}";`
    )
    .join("\n");

  // Generate route constants
  const routeConstants = routes
    .map((route) => {
      const routePathStr = JSON.stringify(route.routePath);
      const routeIdStr = JSON.stringify(route.routeId);
      return `const ${route.routeName} = ${route.importName}.update({
  id: ${routeIdStr},
  path: ${routePathStr},
  getParentRoute: () => rootRouteImport,
} as any);`;
    })
    .join("\n\n");

  // Generate FileRoutesByFullPath
  const fullPathEntries = routes
    .map(
      (route) =>
        `  ${JSON.stringify(route.fullPath)}: typeof ${route.routeName};`
    )
    .join("\n");

  // Generate FileRoutesById
  const idEntries = routes
    .map(
      (route) =>
        `  ${JSON.stringify(route.routeId)}: typeof ${route.routeName};`
    )
    .join("\n");

  // Generate fullPaths union
  const fullPaths = routes
    .map((r) => JSON.stringify(r.fullPath))
    .join("\n    | ");

  // Generate to union (same as fullPaths)
  const toPaths = fullPaths;

  // Generate id union
  const ids = routes.map((r) => JSON.stringify(r.routeId)).join("\n    | ");

  // Generate RootRouteChildren
  const rootChildren = routes
    .map((route) => `  ${route.routeName}: typeof ${route.routeName};`)
    .join("\n");

  // Generate rootRouteChildren object
  const rootChildrenObj = routes
    .map((route) => `  ${route.routeName},`)
    .join("\n");

  // Generate FileRoutesByPath
  const fileRoutesByPath = routes
    .map(
      (route) => `    ${JSON.stringify(route.routeId)}: {
      id: ${JSON.stringify(route.routeId)}
      path: ${JSON.stringify(route.routePath)}
      fullPath: ${JSON.stringify(route.fullPath)}
      preLoaderRoute: typeof ${route.importName}
      parentRoute: typeof rootRouteImport
    }`
    )
    .join("\n");

  const content = `/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.

import { Route as rootRouteImport } from "./routes/__root";
${imports}

${routeConstants}

export interface FileRoutesByFullPath {
${fullPathEntries}
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
  __root__: typeof rootRouteImport;
${idEntries}
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | ${fullPaths};
  fileRoutesByTo: FileRoutesByTo;
  to:
    | ${toPaths};
  id:
    | "__root__"
    | ${ids};
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
${rootChildren}
}

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexRouteImport;
      parentRoute: typeof rootRouteImport;
    };
${fileRoutesByPath}
  }
}

const rootRouteChildren: RootRouteChildren = {
${rootChildrenObj}
};

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();
`;

  fs.writeFileSync(outFile, content);
  console.log(
    `✅ routeTree.gen.ts generated successfully with ${routes.length} routes!`
  );
}

generateRouteTree();
