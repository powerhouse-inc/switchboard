var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// operations/users/subscribe.ts
var subscribe_exports = {};
__export(subscribe_exports, {
  default: () => subscribe_default
});
module.exports = __toCommonJS(subscribe_exports);

// generated/wundergraph.factory.ts
var import_operations = require("@wundergraph/sdk/operations");
var import_operations2 = require("@wundergraph/sdk/operations");
var createOperation = (0, import_operations.createOperationFactory)();

// operations/users/subscribe.ts
var subscribe_default = createOperation.subscription({
  input: import_operations2.z.object({
    id: import_operations2.z.string()
  }),
  handler: async function* ({ input }) {
    try {
      for (let i = 0; i < 10; i++) {
        yield {
          id: input.id,
          name: "Jens",
          bio: "Founder of WunderGraph",
          time: new Date().toISOString()
        };
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    } finally {
      console.log("client disconnected");
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=subscribe.cjs.map
