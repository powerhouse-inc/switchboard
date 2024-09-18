import { enumType, objectType, unionType } from 'nexus';
import { documentModelInterface } from '../document';

export const AddElementInput = objectType({
  name: 'AddElementInput',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('path');
    t.nonNull.field('type', { type: ScopeFrameworkElementType });
    t.string('name');
    t.field('components', { type: ElementComponents });
  }
});

export const ArticleComponent = objectType({
  name: 'ArticleComponent',
  definition(t) {
    t.string('content');
  }
});

export const CoreComponent = objectType({
  name: 'CoreComponent',
  definition(t) {
    t.string('content');
  }
});

export const MoveElementInput = objectType({
  name: 'MoveElementInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.id('newParentId');
  }
});

export const RemoveElementInput = objectType({
  name: 'RemoveElementInput',
  definition(t) {
    t.nonNull.id('id');
  }
});

export const ReorderElementsInput = objectType({
  name: 'ReorderElementsInput',
  definition(t) {
    t.nonNull.id('parentElementId');
    t.nonNull.list.nonNull.id('order');
  }
});

export const ScopeComponent = objectType({
  name: 'ScopeComponent',
  definition(t) {
    t.string('content');
  }
});

export const ScopeFrameworkElement = objectType({
  name: 'ScopeFrameworkElement',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('path');
    t.nonNull.int('version');
    t.string('name');
    t.field('type', { type: ScopeFrameworkElementType });
    t.field('components', { type: ElementComponents });
  }
});

export const ScopeFrameworkState = objectType({
  name: 'ScopeFrameworkState',
  definition(t) {
    t.nonNull.string('rootPath');
    t.nonNull.list.nonNull.field('elements', { type: ScopeFrameworkElement });
  }
});

export const SectionComponent = objectType({
  name: 'SectionComponent',
  definition(t) {
    t.string('content');
  }
});

export const SetRootPathInput = objectType({
  name: 'SetRootPathInput',
  definition(t) {
    t.nonNull.string('newRootPath');
  }
});

export const TypeSpecificationComponent = objectType({
  name: 'TypeSpecificationComponent',
  definition(t) {
    t.string('name');
    t.string('overview');
    t.field('category', { type: TypeSpecificationComponentCategory });
    t.string('documentIdentifierRules');
    t.string('typeAuthority');
    t.string('additionalLogic');
  }
});

export const UpdateElementComponentsInput = objectType({
  name: 'UpdateElementComponentsInput',
  definition(t) {
    t.nonNull.id('id');
    t.field('components', { type: ElementComponents });
  }
});

export const UpdateElementNameInput = objectType({
  name: 'UpdateElementNameInput',
  definition(t) {
    t.nonNull.id('id');
    t.string('name');
  }
});

export const UpdateElementTypeInput = objectType({
  name: 'UpdateElementTypeInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: ScopeFrameworkElementType });
  }
});

export const ElementComponents = unionType({
  name: 'ElementComponents',
  definition(t) {
    t.members(
      ScopeComponent,
      ArticleComponent,
      SectionComponent,
      CoreComponent,
      TypeSpecificationComponent
    );
  },
  resolveType: e => {
    // TODO: need to proper resolve single components
    if (e.content) {
      return 'CoreComponent';
    }

    return 'TypeSpecificationComponent';
  }
});

export const ScopeFrameworkElementType = enumType({
  name: 'ScopeFrameworkElementType',
  members: ['Scope', 'Article', 'Section', 'Core', 'TypeSpecification']
});

export const TypeSpecificationComponentCategory = enumType({
  name: 'TypeSpecificationComponentCategory',
  members: ['Primary', 'Supporting', 'Immutable', 'Accessory']
});

export const ScopeFrameworkDocument = objectType({
  name: 'ScopeFramework',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: ScopeFrameworkState });
    t.nonNull.field('initialState', { type: ScopeFrameworkState });
  }
});
