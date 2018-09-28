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
      ++i;
    });
    return res;
  };

  function parse(html) {
    let level = -1;
    const arr = [];
    const placeholders = [];
    html.replace(TAG_RE, function (tag, index) {
      console.log('Level: ' + level);
      console.log('Tag: ' + tag);
      var isOpen = tag.charAt(1) !== '/';
      var start = index + tag.length;
      var nextChar = html.charAt(start);
      let name;
      let voidElement;
      var parent;
      let currNode;
      if (isOpen) {
        level++;
        ({name, voidElement} = parseTag(tag));
        currNode = document.createElement(name);
        if (!voidElement && nextChar && nextChar !== '<') {
          const content = html.slice(start, html.indexOf('<', start));
          console.log(content);
          const tokens = content.split('foo');
          currNode.appendChild(document.createTextNode(tokens[0]));
          // Fencepost.
          for (let i = 1, len = tokens.length; i < len; ++i) {
            const element = document.createTextNode('foo');
            currNode.appendChild(element);
            placeholders.push(element);

            currNode.appendChild(document.createTextNode(tokens[i]));
          }
        }
        parent = arr[level - 1];
        if (parent) {
          parent.append(currNode);
        }
        arr[level] = currNode;
      }
      if (!isOpen || voidElement) {
        level--;
        if (nextChar !== '<' && nextChar) {
          // trailing text node
          arr[level].appendChild(
              document.createTextNode(
                html.slice(start, html.indexOf('<', start))));
        }
      }
    });

    const frag = document.createDocumentFragment();
    frag.appendChild(arr[0]);
    return {
      frag,
      placeholderNodes: placeholders
    };
  }

  function updateSlot(node, value) {
    if(value && value.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
      node.parentNode.replaceChild(value, node);
    } else {
      node.nodeValue = value;
    }
  }

  const template = (container, ...rest) => {
    const frag = component(...rest);
    container.appendChild(frag);
  };

  let cache = new WeakMap();
  const component = (strings, ...values) => {
    let entry = cache.get(strings);
    // Instantiate Fragment, and get list of placeholder nodes.
    if (entry === undefined) {
      const {frag, placeholderNodes} = parse(strings.join('foo'));
      cache.set(strings, {
        frag,
        placeholderNodes,
        values
      });
      for (let i = 0, len = placeholderNodes.length; i < len; ++i) {
        updateSlot(placeholderNodes[i], values[i]);
      }
      return frag;
    } else {
      let placeholderNodes = entry.placeholderNodes;
      let previousValues = entry.values;
      // Updated DIFFed nodes.
      for (let i = 0, len = previousValues.length; i < len; ++i) {
        let value = values[i];
        if (previousValues[i] != value) {
          console.log(`Updating ${i}, from ${previousValues[i]} with ${value}`);
          updateSlot(placeholderNodes[i], value);
          previousValues[i] = value;
        }
      }
      return entry.frag;
    }
  };
  window.app = container => {
    return template.bind(null, container);
  };
  window.component = component;
})();