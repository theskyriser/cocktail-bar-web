import {
    TBar,
    TBarApi,
    TStockCategory,
    TStockCategoryApi,
    TStockItem,
    TStockItemApi,
} from '../_domain/model.bar';

export function barAdapter(input: TBarApi): TBar {
    return {
        name: input.name,
        categories: input.categories.map((category: TStockCategoryApi) =>
            stockCategoryAdapter(category),
        ),
    };
}

export function stockCategoryAdapter(input: TStockCategoryApi): TStockCategory {
    return {
        id: input.id,
        type: input.type,
        name: input.name,
        items: input.items.map((item: TStockItemApi) => stockItemAdapter(item)),
    };
}

export function stockItemAdapter(input: TStockItemApi): TStockItem {
    return {
        id: input.id,
        name: input.name,
        amount: input.amount,
        bottleSize: input.bottle_size,
        defaultUnit: input.default_unit,
        percentageFilled: input.percentage_filled,
    };
}
