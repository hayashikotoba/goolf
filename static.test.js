const {$component} = require('./dist/static.min');

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

test('zero slots', () => {
  const frag = $component()`<div></div>`;
  expectHtml(frag).toBe('<div></div>');
});

test('one slots', () => {
  const frag = $component()`<div>${5}</div>`;
  expectHtml(frag).toBe('<div>5</div>')
});

test('multiple slots', () => {
  const frag = $component()`<div> A ${1} , B: ${2} , C: ${3}</div>`;
  expectHtml(frag).toBe('<div> A 1 , B: 2 , C: 3</div>')
});

test('with childen', () => {
  const frag = $component()`<div> ${1} <ul><li>A <span>${2}</span> B</li> <li>${3}</li></ul></div>`;
  expectHtml(frag).toBe('<div>1<ul><li>A <span>2</span> B</li><li>3</li></ul></div>');
});

test('subcomponent', () => {
  const frag1 = $component()`<div>${1}</div>`;
  const frag2 = $component()`<div>${frag1}</div>`;
  expectHtml(frag1).toBe("");
  expectHtml(frag2).toBe("<div><div>1</div></div>");
});

test('update subcomponent before adding to parent', () => {
  const blueprintA = $component();
  const frag1 = blueprintA`<div>${1}</div>`;
  blueprintA`<div>${2}</div>`;

  const frag2 = $component()`<div>${frag1}</div>`;
  expectHtml(frag1).toBe("");
  expectHtml(frag2).toBe("<div><div>2</div></div>");
});

test('updating subcomponent after adding to parent', () => {
  const blueprintA = $component();
  const frag1 = blueprintA`<div>${1}</div>`;
  const frag2 = $component()`<div>${frag1}</div>`;
  blueprintA`<div>${2}</div>`;
  expectHtml(frag1).toBe("");
  expectHtml(frag2).toBe("<div><div>2</div></div>");
});

test('slot of empty array', () => {
  const blueprint = $component();
  const frag = blueprint`<div>${[]}</div>`;
  expectHtml(frag).toBe('<div></div>')
});

test('slot of single element array', () => {
  const child = $component()`<p></p>`;

  const blueprint = $component();
  const frag = blueprint`<div>${[child]}</div>`;

  expectHtml(frag).toBe('<div><p></p></div>')
});

test('slot of n-element array', () => {
  const a = $component()`<p></p>`;
  const b = $component()`<span></span>`;
  const blueprint = $component();
  const frag = blueprint`<div>${[a, b]}</div>`;
  expectHtml(frag).toBe('<div><p></p><span></span></div>')
});

test('updating slot of array', () => {
  const a = $component()`<a></a>`;
  const b = $component()`<b></b>`;
  const c = $component()`<c></c>`;

  const blueprint = $component();
  const frag = blueprint`<div>${[a, b, c]}</div>`;

  const d = $component()`<d></d>`;
  blueprint`<div>${[b, d]}</div>`;

  expectHtml(frag).toBe('<div><b></b><d></d></div>')
});

test('with slot as last child', () => {
  const blueprint = $component();
  const frag = blueprint`<div> ${1} <ul><li>A <span>${2}</span> B</li> <li>${3}</li>  ${4}  </ul></div>`;
  expectHtml(frag).toBe('<div>1<ul><li>A <span>2</span> B</li><li>3</li>4</ul></div>');
});

test('with slot as last child 2', () => {
  const blueprint = $component();
  const frag = blueprint`<div> ${1} <ul><li>A <span>${2}</span> B</li> <li>${3}</li></ul> ${4} </div>`;
  expectHtml(frag).toBe('<div>1<ul><li>A <span>2</span> B</li><li>3</li></ul>4</div>');
});

test('in wrapper class', () => {
  class Component {
    constructor(height, width) {
      this.height = height;
      this.width = width;
      this.blueprint = $component();
    }
    update() {
      return this.blueprint`<div><p>Height: ${this.height}</p><p>Width: ${this.width}</p></div>`;
    }
    double() {
      this.height *= 2;
      this.width *= 2;
    }
  }
  const c = new Component(5, 7);
  const frag = c.update();
  expectHtml(frag).toBe('<div><p>Height: 5</p><p>Width: 7</p></div>');
  c.double();
  expectHtml(frag).toBe('<div><p>Height: 5</p><p>Width: 7</p></div>');
  c.update();
  expectHtml(frag).toBe('<div><p>Height: 10</p><p>Width: 14</p></div>');
});

test('outer whitespace', () => {
  const frag = $component()`
    <div></div>
  `;
  expectHtml(frag).toBe('<div></div>');
});
test('indentation', () => {
  const frag = $component()`
    <div>
      <ul>
      </ul>
    </div>
  `;
  expectHtml(frag).toBe('<div><ul></ul></div>');
});
