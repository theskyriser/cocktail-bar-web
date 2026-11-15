export type TBarApi = {
    name: string;
    categories: TStockCategoryApi[];
};

export type TStockCategoryApi = {
    id: number;
    type: string;
    name: string;
    items: TStockItemApi[];
};

export type TStockItemApi = {
    id: number;
    name: string;
    amount: number;
    bottle_size: number | null;
    default_unit: string;
    percentage_filled: number | null;
};

export type TBar = {
    name: string;
    categories: TStockCategory[];
};

export type TStockCategory = {
    id: number;
    type: string;
    name: string;
    items: TStockItem[];
};

export type TStockItem = {
    id: number;
    name: string;
    amount: number;
    bottleSize: number | null;
    defaultUnit: string;
    percentageFilled: number | null;
};
