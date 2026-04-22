import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OutcomeBanner } from "@/components/OutcomeBanner";

describe("OutcomeBanner", () => {
  it("renders 'You won' when assigned marker matches the winner", () => {
    render(<OutcomeBanner winner="X" assignedMarker="X" />);
    expect(screen.getByRole("status")).toHaveTextContent("You won");
  });

  it("renders 'You lost' when opponent wins", () => {
    render(<OutcomeBanner winner="O" assignedMarker="X" />);
    expect(screen.getByRole("status")).toHaveTextContent("You lost");
  });

  it("renders 'Draw'", () => {
    render(<OutcomeBanner winner="draw" assignedMarker="X" />);
    expect(screen.getByRole("status")).toHaveTextContent("Draw");
  });

  it("renders nothing when winner is null", () => {
    const { container } = render(<OutcomeBanner winner={null} assignedMarker="X" />);
    expect(container.firstChild).toBeNull();
  });
});
