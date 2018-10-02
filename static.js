(function () {
  const ATTR_REGEX = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g;
  const TAG_RE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
  // http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
  const voidElements = new Set('br','col','hr','img','input','link','meta');
  const DELIMITER = 'Þ';

  function randomId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  function parseTag(tag) {
    let i = 0, key;
    const res = { name: '' , voidElement: false, attrs: {} };
    tag.replace(ATTR_REGEX, function (match) {
      if (i % 2) {
        key = match;
      } else if (i === 0) {
        if (voidElements.has(match) || tag.charAt(tag.length - 2) === '/') res.voidElement = true;
        res.name = match;
      } else {
        res.attrs[key] = match.replace(/['"]/g, '');
      }
      ++i;
    });
    return res;
  };

  function parse(html) {
    let level = -1;
    const arr = [], placeholders = [];
    html.replace(TAG_RE, function (tag, index) {
      const isOpen = tag.charAt(1) !== '/',
          start = index + tag.length,
          nextChar = html.charAt(start);
      let voidElement;
      if (isOpen) {
        level++;
        let name;
        ({name, voidElement} = parseTag(tag));
        const currNode = document.createElement(name);
        if (!voidElement && nextChar && nextChar !== '<') {
          const content = html.slice(start, html.indexOf('<', start));
          const tokens = content.split(DELIMITER);
          currNode.appendChild(document.createTextNode(tokens[0]));
          for (let i = 1, len = tokens.length; i < len; ++i) {
            const element = document.createTextNode(DELIMITER);
            currNode.appendChild(element);
            placeholders.push(element);
            currNode.appendChild(document.createTextNode(tokens[i]));
          }
        }
        const parent = arr[level - 1];
        if (parent) parent.append(currNode);
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
      const {childNodes} = parent;
      let i = 0, j = 0;
      while(i < childNodes.length && j < value.length) {
        const uuid = childNodes[i].uuid;
        if(!uuid) { i++; continue; }
        if(uuid == value[j].uuid) { i++; j++; continue; }
        if(value.some(e => e.uuid == uuid)) {
          parent.insertBefore(value[j], parent.childNodes[i]);
          j++; i++;
        } else {
          parent.removeChild(parent.childNodes[i]);
        }
      }
      while(j < value.length) { parent.appendChild(value[j]); j++; }
    } else {
      slot.node.nodeValue = value;
    }
  }

  const template = (container, ...rest) => {
    const appComponent = blueprint.bind(null, "#foo");
    container.appendChild(appComponent(...rest));
  };

  const component = id => {
    return blueprint.bind(null, id);
  }

  const cache = new Map();
  const blueprint = (id, strings, ...values) => {
    const entry = cache.get(id);
    // Instantiate Fragment, and get list of placeholder nodes.
    if (entry === undefined) {
      const {frag, slots} = parse(strings.join(DELIMITER));
      cache.set(id, {
        slots,
        values
      });
      for (let i = 0, len = slots.length; i < len; ++i) {
        const value = values[i];
        if(Array.isArray(value)) {
          const frag = document.createDocumentFragment();
          for(let i = 0, len = value.length; i < len; ++i)
            frag.appendChild(value[i]);
          slots[i].parent.appendChild(frag);
        } else {
          updateSlot(slots[i], value);
        }
      }
      frag.uuid = randomId();
      frag.firstChild.uuid = frag.uuid;
      return frag;
    } else {
      const {slots, values: previousValues} = entry;
      // Updated DIFFed nodes.
      for (let i = 0, len = previousValues.length; i < len; ++i) {
        const value = values[i];
        if (previousValues[i] != value) {
          updateSlot(slots[i], value);
          previousValues[i] = value;
        }
      }
    }
  };
  const StaticJs = {
    $component: component,
    $blueprint:  blueprint,
    $app:  container => template.bind(null, container),
  };
  window.StaticJs = StaticJs;
  if(module) {
    module.exports = StaticJs;
  }
})();