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
      const isOpen = tag.charAt(1) !== '/';
      const start = index + tag.length;
      const nextChar = html.charAt(start);
      let voidElement;
      if (isOpen) {
        level++;
        let name;
        ({name, voidElement} = parseTag(tag));
        const currNode = document.createElement(name);
        if (!voidElement && nextChar && nextChar !== '<') {
          const content = html.slice(start, html.indexOf('<', start));
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
        const parent = arr[level - 1];
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
      slots: placeholders.map(node => ({node, parent: node.parentNode}))
    };
  }

  function updateSlot(slot, value) {
    if(value && value.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
      slot.node.parentNode.replaceChild(value, slot.node);
    } else if (Array.isArray(value)) {
      const {parent} = slot;
      while(parent.firstChild)
        parent.removeChild(parent.firstChild);
      const frag = new DocumentFragment();
      for(let i = 0, len = value.length; i < len; ++i)
        frag.appendChild(value[i].cloneNode(true));
      parent.appendChild(frag);
    } else {
      slot.node.nodeValue = value;
    }
  }

  const template = (container, ...rest) => {
    const frag = component(...rest);
    container.appendChild(frag);
  };

  const cache = new WeakMap();
  const component = (strings, ...values) => {
    const entry = cache.get(strings);
    // Instantiate Fragment, and get list of placeholder nodes.
    if (entry === undefined) {
      const {frag, slots} = parse(strings.join('foo'));
      cache.set(strings, {
        frag,
        slots,
        values
      });
      for (let i = 0, len = slots.length; i < len; ++i) {
        updateSlot(slots[i], values[i]);
      }
      return frag;
    } else {
      const {slots, values: previousValues, frag} = entry;
      // Updated DIFFed nodes.
      for (let i = 0, len = previousValues.length; i < len; ++i) {
        const value = values[i];
        if (previousValues[i] != value) {
          updateSlot(slots[i], value);
          previousValues[i] = value;
        }
      }
      return frag;
    }
  };
  window.app = container => {
    return template.bind(null, container);
  };
  window.component = component;
})();