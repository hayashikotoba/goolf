(() => {

const ATTR_REGEX = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g;
const TAG_RE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;

// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
const voidElements = new Set(['br','col','hr','img','input','link','meta']);
const DELIMITER = 'Þ';

const randomId = () => '_' + Math.random().toString(36).substr(2, 9);

const parseTag = tag => {
  let i = 0, key;
  const res = { name: '' , voidElement: false, attrs: {} };
  tag.replace(ATTR_REGEX, match => {
    if (i % 2) {
      key = match;
    } else if (i === 0) {
      if (voidElements.has(match) || tag[tag.length - 2] === '/') res.voidElement = true;
      res.name = match;
    } else {
      res.attrs[key] = match.replace(/['"]/g, '');
    }
    ++i;
  });
  return res;
};

const splitContent = (html, start, parentNode, placeholders) => {
  const content = html.slice(start, html.indexOf('<', start)),
    tokens = content.split(DELIMITER);
  if(tokens[0].trim().length > 0)
    parentNode.appendChild(document.createTextNode(tokens[0]));
  for (let i = 1, len = tokens.length; i < len; ++i) {
    const element = document.createTextNode(DELIMITER);
    parentNode.appendChild(element);
    placeholders.push(element);
    if(tokens[i].trim().length > 0)
      parentNode.appendChild(document.createTextNode(tokens[i]));
  }
};

const parse = html => {
  let level = -1;
  const arr = [], placeholders = [];
  html.replace(TAG_RE, (tag, index) => {
    const isOpen = tag[1] !== '/',
        start = index + tag.length,
        nextChar = html[start];
    let voidElement;
    if (isOpen) {
      level++;
      let name;
      ({name, voidElement} = parseTag(tag));
      const currNode = document.createElement(name), parent = arr[level - 1];
      if (!voidElement && nextChar && nextChar !== '<')
        splitContent(html, start, currNode, placeholders);
      if (parent) parent.append(currNode);
      arr[level] = currNode;
    }
    if (!isOpen || voidElement) {
      level--;
      // trailing content after last child.
      if (nextChar !== '<' && nextChar)
        splitContent(html, start, arr[level], placeholders);
    }
  });

  const frag = document.createDocumentFragment();
  frag.appendChild(arr[0]);
  return {
    frag,
    slots: placeholders.map(node => ({node, parent: node.parentNode}))
  };
};

const updateSlot = (slot, value) => {
  // nodeType 11 == Node.DOCUMENT_FRAGMENT_NODE.
  if(value && value.nodeType == 11) {
    slot.node.parentNode.replaceChild(value, slot.node);
  } else if (Array.isArray(value)) {
    const {parent} = slot;
    const {childNodes} = parent;
    for(let i=j=0;i < childNodes.length && j < value.length;) {
      const uuid = childNodes[i].uuid;
      if(!uuid) i++;
      else if (uuid == value[j].uuid) i++, j++;
      else if(value.some(e => e.uuid == uuid)) parent.insertBefore(value[j++], parent.childNodes[i++]);
      else parent.removeChild(parent.childNodes[i]);
    }
    while(j < value.length) parent.appendChild(value[j++]);
  } else {
    slot.node.nodeValue = value;
  }
};

const component = () => {
  let _slots, _values;
  return (strings, ...values) => {
    if (!_slots) {
      const {frag, slots} = parse(strings.join(DELIMITER).trim());
      for (let i = 0, len = slots.length; i < len; ++i) {
        const value = values[i];
        if(Array.isArray(value)) {
          slots[i].node.nodeValue = '';
          const frag = document.createDocumentFragment();
          for(let j = 0, len = value.length; j < len;)
            frag.appendChild(value[j++]);
          slots[i].parent.appendChild(frag);
        } else {
          updateSlot(slots[i], value);
        }
      }
      frag.uuid = randomId();
      frag.firstChild.uuid = frag.uuid;
      _slots = slots;
      _values = values;
      return frag;
    } else {
      // Updated DIFFed nodes.
      for (let i = 0, len = values.length; i < len; ++i) {
        const value = values[i];
        if (_values[i] != value)
          updateSlot(_slots[i], value),_values[i] = value;
      }
    }
  }
};

const StaticJs = {
  $component: component,
};
window.StaticJs = StaticJs;
if(module) {
  module.exports = StaticJs;
}

})();