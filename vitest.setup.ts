import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement the Pointer Capture APIs — Product360Viewer relies on them
// during drag, so stub them out as no-ops for tests.
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
