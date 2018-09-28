# Static.js

Static.js is a minimalist JavaScript nano ViewModel framework for building stateful web applications 
characterized by persistent DOM structures.

- **minimal** — restraint in design, philosophy, feature creep
- **standalone** — zero runtime, build, tooling dependencies
- **lightweight** — targets 1kB distribution 
- **standard** — leverages modern JavaScript constructs. There is no DSL to learn.
- **focused** — rendering views expressed as template literals to the DOM
- **simple** — small API surface
- **tailored** — not intended to be general purpose and addresses a narrow class of web applications

### Assumptions / Constraints

1. The template is static and persistent. There are stateful slots, but the HTML is static. 
2. Users plugs in their own controller mechanism.

As correlary to (1), the number of slots are fixed, their nodes cacheable. 

### Real DOM

Currently, the implementation does direct DOM manipulation. No Virtualized DOM or similar abstraction.
References to nodes associated with the slots are held in-memory, and they are mutated when
the data associated with the slot is updated.

The implementation does build an AST, which *is* a virtualization of the DOM, but this step is
for placing the slot nodes, and retaining references to them. This operation is performed once, and
not for the purposes of DIFF/PATCH against the DOM. 

A benefit real DOM mutation is not needing to synchronize between VDOM and other direct DOM
manipulations.

### ViewModel

In model–view–viewmodel ( MVVM ) architectural pattern, the viewmodel is the glue mediating the
view and the model. With Static.js, users specify the view as a Template Literal, the model as,
without loss of generality, an arbitrary JavaScript Object, and the ViewModel is the mapping
from the model to the View. 

Data flow is uni-directional. The view maps *from* state, but not vice versa. 

There is no control mechanism induced here.

### Template Directives

There are none.

### Backlog
- Allow clients to build a customized distribution from source, with only the features they need. Akin to NGINX modules.
   - Modularize features of the ViewModel layer
   - Provide additional App layers in addition to the ViewModel, such as a Function-Reactive abstraction
   - Merge the AST construction and DOM insertion into a single pass.
   - Convert DOM insertion from a recursive to a iterative implementation. Can be folded into previous task.
   - Potentially support for-loops / dynamic number of slots, with sub components

