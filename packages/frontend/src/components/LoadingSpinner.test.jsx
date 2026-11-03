import { render } from '@testing-library/react';

import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders a spinning circle centered in its container', () => {
    const { container } = render(<LoadingSpinner />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    expect(wrapper.firstChild).toHaveClass('animate-spin', 'rounded-full');
  });
});
