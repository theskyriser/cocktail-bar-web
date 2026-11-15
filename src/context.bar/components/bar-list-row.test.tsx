import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import BarListRow from './bar-list-row';
import { makeItem } from '../__fixtures/bar.fixture';

const item = makeItem();

const nullPercentage = makeItem({
    name: 'Limes',
    amount: 1,
    bottleSize: null,
    defaultUnit: 'count',
    percentageFilled: null,
});

describe('BarListRow', () => {
    it('renders the item name, amount and unit', () => {
        render(<BarListRow item={item} />);

        expect(screen.getByText('Tanqueray')).toBeDefined();
        expect(screen.getByText('420')).toBeDefined();
        expect(screen.getByText('ml')).toBeDefined();
    });

    it('renders a progress bar when percentageFilled is set', () => {
        render(<BarListRow item={item} />);

        expect(
            screen.getByRole('progressbar').getAttribute('aria-valuenow'),
        ).toBe('0.6');
    });

    it('renders no progress bar when percentageFilled is null', () => {
        render(<BarListRow item={nullPercentage} />);

        expect(screen.queryByRole('progressbar')).toBeNull();
    });
});
