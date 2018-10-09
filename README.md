# Goolf

Goolf is a sub-1kB ViewModel with support for component-based (tree) architectures.

Templates are declared with ES6 Template Literals. Modern browsers
support this out-of-the-box, eliminating complicated tooling to compile templates (ie: JSX).

The distributable is configurable. Unused features can be flagged off for
dead-code elimination. The most basic configuration weighs-in at below 500 bytes.

- **minimal** — restraint in design, philosophy, feature creep
- **standalone** — library has zero dependencies
- **lightweight** — targets sub-1kB distributable
- **focused** — bind view to state. that's it.
- **simple** — small API surface.
- **tailored** — not general purpose and addresses a narrow class of web applications
- **modern** - leverage ES6 Template Literals in modern browsers
- **configurable** - pay (in bytes) for only the used features 

### Assumptions / Constraints

1. Template archectype is persistent. The number of slots is unchanged
2. Users plugs in their own controller mechanism.
3. Slots always have a parent node, and are not the root.
4. Slots do not change type
5. Slots containing array of Frags will not have siblings (implementation clear all children of parent)
6. Components have a single root.
7. Array slot may be updated to other arrays, but never to null.

### Real DOM

Goolf performs direct DOM manipulation.
There is no overhead of syncing to virtualized DOM or similar abstraction.
References to nodes associated with the slots are held in-memory, and mutated when slot DIFF.

### ViewModel

In model–view–viewmodel ( MVVM ), viewmodel is the glue mediating
view and model. With Goolf, users specify the view as a Template Literal, the model as,
without loss of generality, an arbitrary JavaScript Object, and the ViewModel is the mapping
from the model to the View.

Data flow is uni-directional. State maps to views, but not vice versa.

There is no control control mechanism induced here.
