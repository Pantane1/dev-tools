import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopyButton } from "@/components/CopyButton";

describe("CopyButton", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("is disabled when value is empty", () => {
    render(<CopyButton value="" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("copies the value to the clipboard and shows confirmation", async () => {
    render(<CopyButton value="hello world" />);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });
});
