import { Label } from '@/common/components/ui/label';
import { TStockItem } from '../_domain/model.bar';
import { ProgressBar } from '@/common/components/progress-bar';

type TBarListRowProps = {
    item: TStockItem;
};

export default function BarListRow({ item }: TBarListRowProps) {
    return (
        <div className="grid grid-cols-2 border-b py-2">
            <Label className="text-sm text-foreground">{item.name}</Label>
            <div className="flex items-center justify-end gap-2">
                <div className="flex gap-1">
                    <Label>{item.amount}</Label>
                    <Label>{item.defaultUnit}</Label>
                </div>
                {item.percentageFilled !== null && (
                    <ProgressBar
                        value={item.percentageFilled}
                        label="percentage-filled"
                    ></ProgressBar>
                )}
            </div>
        </div>
    );
}
