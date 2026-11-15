import { describe, expect, it } from 'vite-plus/test';
import { barAdapter } from './bar.adapter';
import {
    makeBar,
    makeBarApi,
    makeCategory,
    makeCategoryApi,
    makeItem,
    makeItemApi,
} from '../__fixtures/bar.fixture';

const barApi = makeBarApi();

describe('barAdapter', () => {
    it('maps bottle_size to bottleSize', () => {
        const result = barAdapter(barApi);

        expect(result.categories[0].items[0]).toHaveProperty('bottleSize');
    });

    it('maps default_units to defaultUnit', () => {
        const result = barAdapter(barApi);

        expect(result).toHaveProperty('categories.0.items.0.defaultUnit', 'ml');
    });

    it('preserves a null percentageFilled', () => {
        const apiWithNull = makeBarApi({
            categories: [
                makeCategoryApi({
                    items: [makeItemApi({ percentage_filled: null })],
                }),
            ],
        });
        const result = barAdapter(apiWithNull);
        expect(result.categories[0].items[0].percentageFilled).toEqual(null);
    });

    it('maps every item in every category', () => {
        const api = makeBarApi({
            categories: [
                makeCategoryApi({
                    items: [
                        makeItemApi(),
                        makeItemApi({ id: 101, name: 'Beefeater' }),
                    ],
                }),
                makeCategoryApi({
                    id: 11,
                    name: 'Mixers',
                    type: 'mixers',
                    items: [
                        makeItemApi({
                            id: 200,
                            name: 'Tonic',
                            amount: 4,
                            default_unit: 'count',
                            bottle_size: null,
                            percentage_filled: null,
                        }),
                    ],
                }),
            ],
        });

        const expected = makeBar({
            categories: [
                makeCategory({
                    items: [
                        makeItem(),
                        makeItem({ id: 101, name: 'Beefeater' }),
                    ],
                }),
                makeCategory({
                    id: 11,
                    name: 'Mixers',
                    type: 'mixers',
                    items: [
                        makeItem({
                            id: 200,
                            name: 'Tonic',
                            amount: 4,
                            defaultUnit: 'count',
                            bottleSize: null,
                            percentageFilled: null,
                        }),
                    ],
                }),
            ],
        });

        expect(barAdapter(api)).toEqual(expected);
    });

    it('returns an empty categories array for a bar with no stock', () => {
        const apiWithNoCategories = makeBarApi({ categories: [] });
        const result = barAdapter(apiWithNoCategories);
        expect(result).toHaveProperty('categories');
        expect(result.categories).toHaveLength(0);
    });
});
