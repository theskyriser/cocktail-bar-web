import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import BarList from './bar-list';
import { useGetBar } from '../hooks/use-get-bar';
import { makeBar } from '../__fixtures/bar.fixture';

vi.mock('../hooks/use-get-bar', () => ({
    useGetBar: vi.fn(),
}));

const mockUseGetBar = vi.mocked(useGetBar);

const bar = makeBar();

const barNoCategories = makeBar({ categories: [] });

describe('BarList', () => {
    beforeEach(() => {
        mockUseGetBar.mockReset();
    });

    it('renders a spinner while the bar is loading', () => {
        mockUseGetBar.mockReturnValue({
            bar: null,
            isPending: true,
            isError: false,
        });
        render(<BarList />);

        expect(screen.getByRole('status')).toBeDefined();
    });

    it('renders an error message when the query fails', () => {
        mockUseGetBar.mockReturnValue({
            bar: null,
            isPending: false,
            isError: true,
        });

        render(<BarList />);

        expect(screen.getByText('Trouble loading your bar.')).toBeDefined();
    });

    it('renders each category name once', () => {
        mockUseGetBar.mockReturnValue({
            bar: bar,
            isPending: false,
            isError: false,
        });

        render(<BarList />);

        for (const category of bar.categories) {
            expect(screen.getAllByText(category.name)).toHaveLength(1);
        }
    });

    it('renders a row for every item in a category once', () => {
        mockUseGetBar.mockReturnValue({
            bar: bar,
            isPending: false,
            isError: false,
        });

        render(<BarList />);

        for (const category of bar.categories) {
            for (const item of category.items) {
                expect(screen.getAllByText(item.name)).toHaveLength(1);
            }
        }
    });

    it('renders the empty-bar message when the bar has no categories', () => {
        mockUseGetBar.mockReturnValue({
            bar: barNoCategories,
            isPending: false,
            isError: false,
        });

        render(<BarList />);

        expect(
            screen.getByText('Bar is currently empty. Add some products!'),
        ).toBeDefined();
    });

    it('renders the no bar message when there is no bar', () => {
        mockUseGetBar.mockReturnValue({
            bar: null,
            isPending: false,
            isError: false,
        });

        render(<BarList />);

        expect(
            screen.getByText("You currently don't have a bar."),
        ).toBeDefined();
    });
});
