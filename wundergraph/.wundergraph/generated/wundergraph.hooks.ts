// Code generated by wunderctl. DO NOT EDIT.

import {
	ContinentsResponse,
	CountriesResponse,
	CountriesInput,
	CountriesInputInternal,
	CountriesInputInjected,
} from "./models";
import type {
	BaseRequestContext,
	HooksConfiguration,
	PreUploadHookRequest,
	PreUploadHookResponse,
	PostUploadHookRequest,
	PostUploadHookResponse,
	QueryHook,
	QueryHookWithoutInput,
	MutationHook,
	MutationHookWithoutInput,
	SubscriptionHook,
	SubscriptionHookWithoutInput,
} from "@wundergraph/sdk/server";
import type { InternalClient } from "./wundergraph.internal.client";
import type { User } from "./wundergraph.server";
import { InternalOperationsClient } from "./wundergraph.internal.operations.client";

export type DATA_SOURCES = "countries";

export interface HookContext<TCustomContext = any>
	extends BaseRequestContext<User, InternalClient, InternalOperationsClient, TCustomContext> {}

export type HooksConfig<TCustomContext = any> = HooksConfiguration<
	QueryHooks<TCustomContext>,
	MutationHooks<TCustomContext>,
	SubscriptionHooks<TCustomContext>,
	UploadHooks<TCustomContext>,
	DATA_SOURCES,
	HookContext<TCustomContext>
>;

export type QueryHooks<TCustomContext = any> = {
	Continents?: QueryHookWithoutInput<ContinentsResponse, HookContext<TCustomContext>>;
	Countries?: QueryHook<CountriesInputInjected, CountriesResponse, HookContext<TCustomContext>>;
};

export type MutationHooks<TCustomContext = any> = {};

export type SubscriptionHooks<TCustomContext = any> = {};

export interface UploadHooks<TCustomContext = any> {}
