(() => {

const ATTR_REGEX = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g;
const TAG_RE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;

// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
const voidElements = ['br','col','hr','img','input','link','meta'];
const DELIMITER = 'Þ';

// https://stackoverflow.com/questions/28199100/probability-of-getting-the-same-value-using-math-random/28220928#28220928
const randomId = () => Date.now() + Math.random();

const parseTag = (tag,
    /* Golf variable declaration. */
    i = 0,
    key,
    res = { _terser_name: '' , _terser_voidElement: false, _terser_attrs: {} }) => {
  tag.replace(ATTR_REGEX, match => {
    if (i % 2) {
      key = match;
    } else if (i === 0) {
      if (voidElements.includes(match) || tag[tag.length - 2] === '/') res._terser_voidElement = true;
      res._terser_name = match;
    } else {
      res._terser_attrs[key] = match.replace(/['"]/g, '');
    }
    ++i;
  });
  return res;
};

const splitContent = (html, start, parentNode, slots,
    /* Golf variable declaration. */
    content = html.slice(start, html.indexOf('<', start)),
    tokens = content.split(DELIMITER),
    addTextNode = i => tokens[i].trim().length > 0 && parentNode.appendChild(document.createTextNode(tokens[i]))) => {
  addTextNode(0);
  for (let i = 1, len = tokens.length; i < len; ++i) {
    const element = document.createTextNode(DELIMITER);
    parentNode.appendChild(element);
    slots.push({_terser_node: element, _terser_parent: element.parentNode});
    addTextNode(i);
  }
};

const parse = (html, slots,
    /* Golf variable declaration. */
    level = -1, arr = [])=> {
  html.replace(TAG_RE, (tag, index) => {
    const isOpen = tag[1] !== '/',
        start = index + tag.length,
        nextChar = html[start],
        splitNext = node => nextChar && nextChar !== '<' && splitContent(html, start, node, slots);
    let voidElement;
    if (isOpen) {
      level++;
      let name;
      ({_terser_name: name, _terser_voidElement: voidElement} = parseTag(tag));
      const currNode = document.createElement(name), parent = arr[level - 1];
      splitNext(currNode);
      if (parent) parent.append(currNode);
      arr[level] = currNode;
    }
    if (!isOpen || voidElement) {
      splitNext(arr[--level]);
    }
  });

  const frag = document.createDocumentFragment();
  frag.appendChild(arr[0]);
  return {
    _terser_frag: frag,
  };
};

const updateSlot = (slot, value) => {
  // nodeType 11 == Node.DOCUMENT_FRAGMENT_NODE.
  if(value && value.nodeType == 11) {
    slot._terser_node.parentNode.replaceChild(value, slot._terser_node);
  } else if (Array.isArray(value)) {
    const {_terser_parent: parent} = slot;
    const {childNodes} = parent;
    const length = value.length;
    for(let i=j=0;i < childNodes.length && j < length;) {
      const _terser_uuid = childNodes[i]._terser_uuid;
      if(!_terser_uuid) i++;
      else if (_terser_uuid == value[j]._terser_uuid) i++, j++;
      else if(value.some(e => e._terser_uuid == _terser_uuid)) parent.insertBefore(value[j++], childNodes[i++]);
      else parent.removeChild(childNodes[i]);
    }
    while(j < length) parent.appendChild(value[j++]);
  } else {
    slot._terser_node.nodeValue = value;
  }
};

StaticJS = () => {
  let slots, _values ;
  return (strings, ...values) => {
    if (!slots) {
      slots = [];
      const {_terser_frag: frag} = parse(strings.join(DELIMITER).trim(), slots);
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
      _values = values;
      return frag;
    } else {
      // Updated DIFFed nodes.
      for (let i = 0, len = values.length; i < len; ++i) {
        const value = values[i];
        if (_values[i] != value)
          updateSlot(slots[i], value),_values[i] = value;
      }
    }
  }
};
})();