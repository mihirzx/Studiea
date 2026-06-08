import {render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import MasteryBadge from './MasteryBadge';

describe('MasteryBadge', () => {
    it('shows the label', () => {
        render(<MasteryBadge label="Mastered: Fractions"/>);
        expect(screen.getByText(/Mastered: Fractions/)).toBeInTheDocument();
    })

    it('shows a remove button only when onRemove is provded', () => {
        render(<MasteryBadge label="X"/>);
        expect(screen.queryByRole('button', { name: /remove badge/i})).not.toBeInTheDocument();
    });

    it('calls onRemove when the X is clicked', async() => {
        const onRemove = vi.fn();
        render(<MasteryBadge label="X" onRemove = {onRemove}/>);
        await userEvent.click(screen.getByRole('button', {name: /remove badge/i}));
        expect(onRemove).toHaveBeenCalledTimes(1);
    });
});

