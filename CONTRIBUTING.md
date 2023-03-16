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
      ctx.request.req.log.warn('dangerous');
    });
  },

```

2. Usual logger

In order to maintain the logging structure and be able to filter logs by file they have been produced at the following approach has to be taken:

```typescript
import { getModuleBinding, getChildLogger } from './logger';

const logger = getChildLogger('PREFIX', { module: getModuleBinding(__filename), myOtherCustomBinding: 'Funny guy' });
```

If this approach is used - then it will be possible to filter the logs via providing the corresponding environment variable values. For more on this read the root [README](./README.md)
