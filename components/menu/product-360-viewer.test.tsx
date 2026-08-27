import { describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Product360Viewer } from "@/components/menu/product-360-viewer";

function frames(count: number) {
  return Array.from({ length: count }, (_, i) => `frame-${i}.jpg`);
}

function currentSrc() {
  return screen.getByRole("slider").querySelector("img")?.getAttribute("src");
}

describe("Product360Viewer", () => {
  test("renders nothing when given an empty image array", () => {
    const { container } = render(<Product360Viewer images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the first frame initially", () => {
    render(<Product360Viewer images={frames(6)} />);
    expect(currentSrc()).toBe("frame-0.jpg");
  });

  test("the frame image disables native dragging", () => {
    render(<Product360Viewer images={frames(4)} />);
    const img = screen.getByRole("slider").querySelector("img");
    expect(img).toHaveAttribute("draggable", "false");
  });

  test("dragging horizontally advances frames proportionally to sensitivity", () => {
    render(<Product360Viewer images={frames(8)} sensitivity={4} />);
    const slider = screen.getByRole("slider");

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 108 }); // deltaX 8 / sensitivity 4 = +2 frames
    expect(currentSrc()).toBe("frame-2.jpg");
  });

  test("dragging left wraps continuously to the end of the sequence instead of clamping", () => {
    render(<Product360Viewer images={frames(4)} sensitivity={4} />);
    const slider = screen.getByRole("slider");

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 92 }); // deltaX -8 / 4 = -2 -> frame (0-2+4)%4 = 2
    expect(currentSrc()).toBe("frame-2.jpg");
  });

  test("releasing a drag with no movement leaves the frame unchanged and resets the cursor", () => {
    render(<Product360Viewer images={frames(4)} />);
    const slider = screen.getByRole("slider");

    expect(slider.className).toContain("cursor-grab");
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });
    expect(slider.className).toContain("cursor-grabbing");
    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 100 });

    expect(currentSrc()).toBe("frame-0.jpg");
    expect(slider.className).toContain("cursor-grab");
    expect(slider.className).not.toContain("cursor-grabbing");
  });

  test("ArrowRight/ArrowLeft step one frame at a time and wrap at both ends", () => {
    render(<Product360Viewer images={frames(3)} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(currentSrc()).toBe("frame-2.jpg"); // wraps backward from 0

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(currentSrc()).toBe("frame-1.jpg"); // 2 -> 0 -> 1

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(currentSrc()).toBe("frame-0.jpg"); // 1 -> 2 -> wraps to 0
  });

  test("does not respond to drag when there is only a single frame", () => {
    render(<Product360Viewer images={frames(1)} />);
    const slider = screen.getByRole("slider");

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });
    expect(slider.className).not.toContain("cursor-grabbing");
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 500 });
    expect(currentSrc()).toBe("frame-0.jpg");
  });

  test("exposes aria attributes describing the current frame", () => {
    render(<Product360Viewer images={frames(5)} alt="Vista 360 del plato" />);
    const slider = screen.getByRole("slider", { name: "Vista 360 del plato" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "4");
    expect(slider).toHaveAttribute("aria-valuenow", "0");
  });
});
