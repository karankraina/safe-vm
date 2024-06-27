// Dummy React

globalThis.React = {
  createElement(tagName) {
    return '<h1>This is a test code</h1>';
  },
  useEffect(callback, dependencyArray) {},
};

function HomeComponent() {
  React.useEffect(() => {
    // this is sample code;
  });

  return React.createElement('h1');
}
