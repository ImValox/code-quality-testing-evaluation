import { render, screen } from '@testing-library/react';

import ErrorBoundary from './ErrorBoundary';

const Boom = () => {
  throw new Error('Kaboom');
};

describe('ErrorBoundary', () => {
  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the fallback UI with the error message when a child throws', () => {
    // React et componentDidCatch loguent l'erreur attendue : on garde la sortie propre.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong!' })).toBeInTheDocument();
    expect(screen.getByText('Error: Kaboom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
  });
});
