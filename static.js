(() => {

const ATTR_REGEX = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g;
const TAG_RE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;

// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
const voidElements = new Set(['br','col','hr','img','input','link','meta']);
const DELIMITER = 'Þ';

// https://stackoverflow.com/questions/28199100/probability-of-getting-the-same-value-using-math-random/28220928#28220928
const randomId = () => Date.now() + Math.random();

const parseTag = (tag,
    /* Golf variable declaration. */
    i = 0,
    key,
    res = { name: '' , voidElement: false, attrs: {} }) => {
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

const splitContent = (html, start, parentNode, placeholders,
    /* Golf variable declaration. */
    content = html.slice(start, html.indexOf('<', start)),
    tokens = content.split(DELIMITER)) => {
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

const parse = (html,
    /* Golf variable declaration. */
    level = -1, arr = [], placeholders = [])=> {
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
    _terser_frag: frag,
    _terser_slots: placeholders.map(node => ({_terser_node: node, _terser_parent: node.parentNode}))
  };
};

const updateSlot = (slot, value) => {
  // nodeType 11 == Node.DOCUMENT_FRAGMENT_NODE.
  if(value && value.nodeType == 11) {
    slot._terser_node.parentNode.replaceChild(value, slot._terser_node);
  } else if (Array.isArray(value)) {
    const {_terser_parent: parent} = slot;
    const {childNodes} = parent;
    for(let i=j=0;i < childNodes.length && j < value.length;) {
      const _terser_uuid = childNodes[i]._terser_uuid;
      if(!_terser_uuid) i++;
      else if (_terser_uuid == value[j]._terser_uuid) i++, j++;
      else if(value.some(e => e._terser_uuid == _terser_uuid)) parent.insertBefore(value[j++], parent.childNodes[i++]);
      else parent.removeChild(parent.childNodes[i]);
    }
    while(j < value.length) parent.appendChild(value[j++]);
  } else {
    slot._terser_node.nodeValue = value;
  }
};

StaticJS = () => {
  let _slots, _values ;
  return (strings, ...values) => {
    if (!_slots) {
      const {_terser_frag: frag, _terser_slots: slots} = parse(strings.join(DELIMITER).trim());
      for (let i = 0, len = slots.length; i < len; ++i) {
        const value = values[i];
        if(Array.isArray(value)) {
          slots[i]._terser_node.nodeValue = '';
          const frag = document.createDocumentFragment();
          for(let j = 0, len = value.length; j < len;)
            frag.appendChild(value[j++]);
          slots[i]._terser_parent.appendChild(frag);
        } else {
          updateSlot(slots[i], value);
        }
      }
      frag.firstChild._terser_uuid = frag._terser_uuid = randomId();
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
})();