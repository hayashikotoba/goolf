const {$component}= require('./static');

function fragToHtml(frag) {
  const div = document.createElement('div');
  div.appendChild( frag.cloneNode(true) );
  return div.innerHTML;
}

function randomId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

test('zero slots', () => {
  const blueprint = $component(randomId());
  const frag = blueprint`<div></div>`;
  const html = fragToHtml(frag);
  expect(html).toBe('<div></div>');
});

test('one slots', () => {
  const blueprint_b = $component(randomId());
  const frag = blueprint_b`<div>${5}</div>`;
  const html = fragToHtml(frag);
  expect(html).toBe('<div>5</div>')
});

test('multiple slots', () => {
  const blueprint_b = $component(randomId());
  const frag = blueprint_b`<div> A ${1} , B: ${2} , C: ${3} </div>`;
  const html = fragToHtml(frag);
  expect(html).toBe('<div> A 1 , B: 2 , C: 3 </div>')
});

test('with childen', () => {
  const blueprint_b = $component(randomId());
  const frag = blueprint_b`<div> ${1} <ul><li>A <span>${2}</span> B</li> <li>${3}</li></ul></div>`;
  const html = fragToHtml(frag);
  expect(html).toBe('<div> 1 <ul><li>A <span>2</span> B</li> <li>3</li></ul></div>');
});

test('blueprint refs the same fragment', () => {
  const blueprint = $component(randomId());
  const frag1 = blueprint`<div>${1}</div>`;
  const frag2 = blueprint`<div>${'a'}</div>`;
  const html1 = fragToHtml(frag1);
  const html2 = fragToHtml(frag2);
  expect(html1).toBe("<div>a</div>");
  expect(html2).toBe("<div>a</div>");
  expect(frag1).toBe(frag2);
});

test('subcomponent', () => {
  const blueprintA = $component(randomId());
  const blueprintB = $component(randomId());
  const frag1 = blueprintA`<div>${1}</div>`;
  const frag2 = blueprintB`<div>${frag1}</div>`;
  const html1 = fragToHtml(frag1);
  const html2 = fragToHtml(frag2);
  expect(html1).toBe("");
  expect(html2).toBe("<div><div>1</div></div>");
});

test('update subcomponent before adding to parent', () => {
  const blueprintA = $component(randomId());
  const blueprintB = $component(randomId());
  blueprintA`<div>${1}</div>`;
  const frag1 = blueprintA`<div>${2}</div>`;
  const frag2 = blueprintB`<div>${frag1}</div>`;
  const html1 = fragToHtml(frag1);
  const html2 = fragToHtml(frag2);
  expect(html1).toBe("");
  expect(html2).toBe("<div><div>2</div></div>");
});

test('updating subcomponent after adding to parent', () => {
  const blueprintA = $component(randomId());
  const blueprintB = $component(randomId());
  const frag1 = blueprintA`<div>${1}</div>`;
  const frag2 = blueprintB`<div>${frag1}</div>`;
  blueprintA`<div>${2}</div>`;
  const html1 = fragToHtml(frag1);
  const html2 = fragToHtml(frag2);
  expect(html1).toBe("");
  expect(html2).toBe("<div><div>2</div></div>");
});

// Fix. 4th slot not being replaced.
test('with slot as last child', () => {
  const blueprint_b = $component(randomId());
  const frag = blueprint_b`<div> ${1} <ul><li>A <span>${2}</span> B</li> <li>${3}</li>  ${4}  </ul></div>`;
  const html = fragToHtml(frag);
  expect(html).toBe('<div> 1 <ul><li>A <span>2</span> B</li> <li>3</li>  foo  </ul></div>');
});

// TODO: 4th slot being replaced.
test('with slot as last child 2', () => {
  const blueprint_b = $component(randomId());
  const frag = blueprint_b`<div> ${1} <ul><li>A <span>${2}</span> B</li> <li>${3}</li></ul> ${4} </div>`;
  const html = fragToHtml(frag);
  expect(html).toBe('<div> 1 <ul><li>A <span>2</span> B</li> <li>3</li></ul> foo </div>');
});