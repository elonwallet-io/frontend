import { AsyncDataOptions, NuxtApp } from "#app";
import { PickFrom, KeysOf } from "nuxt/dist/app/composables/asyncData";

export default function useLazyAsyncDataWithCache<TData>(key: string, handler: (ctx?: NuxtApp) => Promise<TData>, options?: AsyncDataOptions<TData>): CacheAsyncData<TData, Error> {
    const cache = useState<TData | null>(key);
    const { data, error, pending, refresh: refreshTData } = useLazyAsyncData<TData>(key, async (ctx) => {
        if (!cache.value)
            cache.value = await handler(ctx);
        return cache.value
    }, options)

    const refresh = async () => {
        cache.value = null;
        await refreshTData();
    }

    return {
        data,
        error,
        pending,
        refresh
    }
}

export interface CacheAsyncData<T, E> {
    data: Ref<PickFrom<T, KeysOf<T>> | null>;
    pending: Ref<boolean>;
    refresh: () => Promise<void>;
    error: Ref<E | null>;
}