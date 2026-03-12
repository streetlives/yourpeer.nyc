import { render, screen } from "@testing-library/react";
import Spinner from "@/components/spinner";

describe("Spinner", () => {
  it("renders a status indicator with loading text", () => {
    render(<Spinner />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
