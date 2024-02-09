
import { objectType } from "nexus";

export const scopeFrameworkState = objectType({
  name: 'ScopeFrameworkState',
  definition(t) {
    t.string('name');
    t.string('icon');
    t.string('slug');
  },
});
