import {
    TBar,
    TBarApi,
    TStockCategory,
    TStockCategoryApi,
    TStockItem,
    TStockItemApi,
} from '../_domain/model.bar';

export const makeItemApi = (
    overrides: Partial<TStockItemApi> = {},
): TStockItemApi => ({
    id: 100,
    name: 'Tanqueray',
    amount: 420,
    default_unit: 'ml',
    percentage_filled: 0.6,
    bottle_size: 700,
    ...overrides,
});

export const makeCategoryApi = (
    overrides: Partial<TStockCategoryApi> = {},
): TStockCategoryApi => ({
    id: 10,
    name: 'Spirits',
    type: 'spirits',
    items: [makeItemApi()],
    ...overrides,
});

export const makeBarApi = (overrides: Partial<TBarApi> = {}): TBarApi => ({
    name: 'My Bar',
    categories: [makeCategoryApi()],
    ...overrides,
});

export const makeItemPayload = (
    overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
    ...makeItemApi(),
    ...overrides,
});

export const makeCategoryPayload = (
    overrides: Record<string, unknown> = {},
    item: Record<string, unknown> = {},
): Record<string, unknown> => ({
    ...makeCategoryApi(),
    items: [makeItemPayload(item)],
    ...overrides,
});

type TPayloadOverrides = {
    bar?: Record<string, unknown>;
    category?: Record<string, unknown>;
    item?: Record<string, unknown>;
};

export const makeBarPayload = ({
    bar = {},
    category = {},
    item = {},
}: TPayloadOverrides = {}): Record<string, unknown> => ({
    ...makeBarApi(),
    categories: [makeCategoryPayload(category, item)],
    ...bar,
});

export const makeItem = (overrides: Partial<TStockItem> = {}): TStockItem => ({
    id: 100,
    name: 'Tanqueray',
    amount: 420,
    defaultUnit: 'ml',
    percentageFilled: 0.6,
    bottleSize: 700,
    ...overrides,
});

export const makeCategory = (
    overrides: Partial<TStockCategory> = {},
): TStockCategory => ({
    id: 10,
    name: 'Spirits',
    type: 'spirits',
    items: [makeItem()],
    ...overrides,
});

export const makeBar = (overrides: Partial<TBar> = {}): TBar => ({
    name: 'My Bar',
    categories: [makeCategory()],
    ...overrides,
});
