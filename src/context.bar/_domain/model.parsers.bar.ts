import {
    expectEach,
    expectNullable,
    expectNumber,
    expectRecord,
    expectString,
} from '@/common/lib/api/parse';
import { TBarApi, TStockCategoryApi, TStockItemApi } from './model.bar';

export function parseBar(input: unknown, field = 'bar'): TBarApi {
    const record = expectRecord(input, field);

    return {
        name: expectString(record.name, `${field}.name`),
        categories: expectEach(
            record.categories,
            `${field}.categories`,
            parseStockCategory,
        ),
    };
}

export function parseStockCategory(
    input: unknown,
    field: string,
): TStockCategoryApi {
    const record = expectRecord(input, field);

    return {
        id: expectNumber(record.id, `${field}.id`),
        type: expectString(record.type, `${field}.type`),
        name: expectString(record.name, `${field}.name`),
        items: expectEach(record.items, `${field}.items`, parseStockItem),
    };
}

export function parseStockItem(input: unknown, field: string): TStockItemApi {
    const record = expectRecord(input, field);

    return {
        id: expectNumber(record.id, `${field}.id`),
        name: expectString(record.name, `${field}.name`),
        amount: expectNumber(record.amount, `${field}.amount`),
        bottle_size: expectNullable(
            record.bottle_size,
            `${field}.bottle_size`,
            expectNumber,
        ),
        default_unit: expectString(
            record.default_unit,
            `${field}.default_unit`,
        ),
        percentage_filled: expectNullable(
            record.percentage_filled,
            `${field}.percentage_filled`,
            expectNumber,
        ),
    };
}
