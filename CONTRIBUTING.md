### Testing structure

The test suite is designed to ensure that some of the modules are fully covered by tests.
Therefore, there're 2 runs of tests: one validates that overall code coverage is on appropriate level, another validates that the code coverage for
a subset of modules is maximal.

The coverage report will therefore contain two tables.

See corresponding configs [`./api/vitest.config.ts`](./api/vitest.config.ts) and [`./api/vitest.modules.config.ts`](./api/vitest.modules.config.ts)

### Logger usage

The project uses `pino` logger. This logger should be used over `console` calls.

For usual in-file logging one should import the logger from the corresponding `logger.ts` module
and use it in accordance with [documentation](https://github.com/pinojs/pino/tree/master/docs).

In case of logging the processes that happen during http request handling it is also
possible to use the dedicated logger that is accessible via the `express` request object.

Here's a couple of examples:

1. Http logging

    ```typescript
    // some resolver code above
    resolve: (_parent, _args, ctx) => {
        ctx.apolloLogger.debug('resolver called');
        });
    },

    ```

2. Usual logger

    In order to maintain the logging structure and be able to filter logs by file they have been produced at the following approach has to be taken:

    ```typescript
    import { getModuleBinding, getChildLogger } from "./logger";

    const logger = getChildLogger(
        { msgPrefix: "PREFIX" },
        { myCustomBinding: "Funny guy" }
    );
    ```

    If this approach is used - then it will be possible to filter the logs via providing the corresponding environment variable values. For more on this read the root [README](./api/README.md)
