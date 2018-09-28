(function () {
  const ATTR_REGEX = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g;
  const TAG_RE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
  // http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
  const voidElements = new Set(
    'br',
    'col',
    'hr',
    'img',
    'input',
    'link',
    'meta');

  function parseTag(tag) {
    let i = 0;
    let key;
    const res = {
      type: 'tag',
      name: '',
      voidElement: false,
      attrs: {},
      children: []
    };
    tag.replace(ATTR_REGEX, function (match) {
      if (i % 2) {
        key = match;
      } else {
        if (i === 0) {
          if (voidElements.has(match) || tag.charAt(tag.length - 2) === '/') {
            res.voidElement = true;
          }
          res.name = match;
        } else {
          res.attrs[key] = match.replace(/['"]/g, '');
        }
      }
      i++;
    });
    return res;
  };

  function parse(html) {
    const result = [];
    let current;
    let level = -1;
    const arr = [];
    html.replace(TAG_RE, function (tag, index) {
      console.log('Level: ' + level);
      console.log('Tag: ' + tag);
      var isOpen = tag.charAt(1) !== '/';
      var start = index + tag.length;
      var nextChar = html.charAt(start);
      var parent;
      if (isOpen) {
        level++;
        current = parseTag(tag);
        if (!current.voidElement && nextChar && nextChar !== '<') {
          const content = html.slice(start, html.indexOf('<', start));
          console.log(content);
          const tokens = content.split('foo');
          current.children.push({
            type: 'text',
            content: tokens[0]
          });
          // Fencepost.
          for (let i = 1; i < tokens.length; i++) {
            current.children.push({
              type: 'placeholder',
              content: 'foo'
            });
            current.children.push({
              type: 'text',
              content: tokens[i]
            });
          }
        }
        if (level === 0) { // if we're at root, push new base node
          result.push(current);
        }
        parent = arr[level - 1];
        if (parent) {
          parent.children.push(current);
        }
        arr[level] = current;
      }
      if (!isOpen || current.voidElement) {
        level--;
        if (nextChar !== '<' && nextChar) {
          // trailing text node
          arr[level].children.push({
            type: 'text',
            content: html.slice(start, html.indexOf('<', start))
          });
        }
      }
    });
    return result;
  };

  function appendChild(parentEl, children, placeholderNodes) {
    for (var i = 0; i < children.length; i++) {
      const child = children[i];
      const type = child.type;
      console.log(child);
      let element;
      if (type == 'tag') {
        element = document.createElement(child.name);
      } else if (type == 'placeholder') {
        element = document.createTextNode(child.content);
        placeholderNodes.push(element);
      } else if (type == 'text') {
        element = document.createTextNode(child.content);
      }

      parentEl.append(element);
      if (child.children) {
        appendChild(element, child.children, placeholderNodes);
      }
    }
  }

  let cache = new WeakMap();
  const template = (container, strings, ...values) => {
    let entry = cache.get(strings);
    // Instantiate Fragment, and get list of placeholder nodes.
    if (entry === undefined) {
      const frag = document.createDocumentFragment();
      const ast = parse(strings.join('foo'));
      const placeholderNodes = [];
      appendChild(frag, ast, placeholderNodes);
      container.appendChild(frag);
      cache.set(strings, {
        frag,
        placeholderNodes,
        values
      });
      for (let i = 0; i < placeholderNodes.length; i++)
        placeholderNodes[i].nodeValue = values[i];
    } else {
      let placeholderNodes = entry.placeholderNodes;
      let previousValues = entry.values;
      // Updated DIFFed nodes.
      for (let i = 0; i < previousValues.length; i++) {
        if (previousValues[i] != values[i]) {
          console.log(`Updating ${i}, from ${previousValues[i]} with ${values[i]}`);
          placeholderNodes[i].nodeValue = values[i];
          previousValues[i] = values[i];
        }
      }
    }
  };
  window.app = container => {
    return template.bind(null, container);
  }
})();