const window = {
  document: {
    createElement(tagName) {},
  },
};

function assignWindow() {
  Object.assign(globalThis, { window });
}
