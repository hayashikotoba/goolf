require('../dist/goolf.basic.min');

const $component = Goolf;

function fragToHtml(frag) {
  const div = document.createElement('div');
  div.appendChild( frag.cloneNode(true) );
  return div.innerHTML;
}

function expectHtml(frag) {
  return expect(fragToHtml(frag));
}

test('zero slots', () => {
  const frag = $component()`<div></div>`;
  expectHtml(frag).toBe('<div></div>');
});

test('one slots', () => {
  const frag = $component()`<div>${5}</div>`;
  expectHtml(frag).toBe('<div>5</div>')
});

test('updating one slots', () => {
  const blueprint = $component();
  const frag = blueprint`<div>${5}</div>`;
  blueprint`<div>${4}</div>`;
  expectHtml(frag).toBe('<div>4</div>')
});

test('updating one slot with null', () => {
  const blueprint = $component();
  const frag = blueprint`<div>${5}</div>`;
  blueprint`<div>${null}</div>`;
  expectHtml(frag).toBe('<div></div>')
});

test('multiple slots', () => {
  const frag = $component()`<div> A ${1} , B: ${2} , C: ${3}</div>`;
  expectHtml(frag).toBe('<div> A 1 , B: 2 , C: 3</div>')
});