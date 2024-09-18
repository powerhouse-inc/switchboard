export function renderGraphqlPlayground(
  url: string,
  query?: string,
  headers: Record<string, string> = {}
): string {
  return `<!doctype html>
    <html lang="en">
      <head>
        <title>GraphiQL</title>
        <style>
          body {
            height: 100%;
            margin: 0;
            width: 100%;
            overflow: hidden;
          }
    
          #graphiql {
            height: 100vh;
          }
        </style>
        <script
          crossorigin
          src="https://unpkg.com/react@18/umd/react.production.min.js"
        ></script>
        <script
          crossorigin
          src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
        ></script>
        <script
          src="https://unpkg.com/graphiql/graphiql.min.js"
          type="application/javascript"
        ></script>
        <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
        <script
          src="https://unpkg.com/@graphiql/plugin-explorer/dist/index.umd.js"
          crossorigin
        ></script>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@graphiql/plugin-explorer/dist/style.css"
        />
      </head>
    
      <body>
        <div id="graphiql">Loading...</div>
        <script>
            var fetcher = GraphiQL.createFetcher({
                url: '${url}',
                headers: ${JSON.stringify(headers)}
            });
            var defaultQuery = ${query ? `\`${query}\`` : undefined};

            if (defaultQuery) {
                var sessionQuery = localStorage.getItem("graphiql:query");
                if (sessionQuery) {
                    localStorage.setItem("graphiql:query", defaultQuery);
                }
            }

            var explorerPlugin = GraphiQLPluginExplorer.explorerPlugin();

            function GraphiQLWithExplorer() {
                return React.createElement(GraphiQL, {
                fetcher: fetcher,
                defaultEditorToolsVisibility: true,
                plugins: [explorerPlugin],
                defaultQuery
                });
            }

            const root = ReactDOM.createRoot(document.getElementById('graphiql'));
            root.render(React.createElement(GraphiQLWithExplorer));
        </script>
      </body>
    </html>`;
}
