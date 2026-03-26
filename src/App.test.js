import { render, screen } from '@testing-library/react';
import App from './App';

test('renders campus marketplace home', () => {
  render(<App />);
  const heading = screen.getByText(/campus marketplace/i);
  expect(heading).toBeInTheDocument();
});
