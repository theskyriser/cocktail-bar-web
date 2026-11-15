import { Label } from '@/common/components/ui/label';
import { TStockCategory, TStockItem } from '../_domain/model.bar';
import { useGetBar } from '../hooks/use-get-bar';
import BarListRow from './bar-list-row';
import { Spinner } from '@/common/components/ui/spinner';

export default function BarList() {
    const { bar, isPending, isError } = useGetBar();

    if (isPending) return <Spinner />;

    if (isError) return <Label>Trouble loading your bar.</Label>;

    return (
        <div>
            {bar?.categories.map((category: TStockCategory) => {
                return (
                    <div className="pt-2" key={category.id}>
                        <Label className="py-2 tracking-widest uppercase">
                            {category.name}
                        </Label>

                        {category.items.map((item: TStockItem) => {
                            return (
                                <BarListRow
                                    key={item.id}
                                    item={item}
                                ></BarListRow>
                            );
                        })}
                    </div>
                );
            })}

            {!bar ? (
                <Label>You currently don't have a bar.</Label>
            ) : (
                (bar?.categories.length === 0 || !bar?.categories) && (
                    <Label>Bar is currently empty. Add some products!</Label>
                )
            )}
        </div>
    );
}
