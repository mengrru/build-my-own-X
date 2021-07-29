"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createElement(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type,
    props: _objectSpread(_objectSpread({}, props), {}, {
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    })
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}
/**
 * for each fiber:
 * 1. add the element to the DOM
 * 2. create the fibers for the element's children
 * 3. select the next unit of work
 */


const isEvent = key => key.substring(0, 2) === 'on';

const isProperty = key => key !== 'children' && !isEvent(key);

const isNew = (prev, next) => key => prev[key] !== next[key];

const isGone = (prev, next) => key => !(key in next);

function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode(fiber.props.nodeValue) : document.createElement(fiber.type);
  Object.keys(fiber.props).filter(isEvent).forEach(name => {
    dom[name.toLowerCase()] = fiber.props[name];
  });
  Object.keys(fiber.props).filter(isProperty).filter(key => !isEvent(key)).forEach(name => {
    dom[name] = fiber.props[name];
  });
  return dom;
}

function updateDom(dom, prevProps, nextProps) {
  Object.keys(prevProps).filter(isEvent).filter(key => isGone(prevProps, nextProps) || isNew(prevProps, nextProps)(key)).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  });
  Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(name => {
    dom[name] = '';
  });
  Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(name => {
    dom[name] = nextProps[name];
  });
  Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  });
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  const domParent = fiber.parent.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let i = 0;

  while (i < elements.length || oldFiber) {
    const e = elements[i];
    let newFiber = null;
    const sameType = oldFiber && e && e.type === oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: e.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      };
    }

    if (e && !sameType) {
      newFiber = {
        type: e.type,
        props: e.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT'
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (i === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    i++;
  }
}

const MiniReact = {
  createElement,
  render
};
/** @jsx MiniReact.createElement */

/*
function App(props) {
    return <h1>Hello, {props.name}</h1>
}
const element = <App name="world" />
const container = document.getElementById('app')
MiniReact.render(element, container)
const container = document.getElementById('app')
*/

const updateValue = e => {
  rerender(e.target.value);
};

const rerender = value => {
  const element = MiniReact.createElement("div", null, MiniReact.createElement("input", {
    onInput: updateValue,
    value: value
  }), MiniReact.createElement("h2", null, "Hello, ", value));
  MiniReact.render(element, container);
};

rerender('World');
/*
const container = document.getElementById('app')
const element = (
    <div id="foo">
        <h1>
            <p></p>
            <a></a>
        </h1>
        <p>hello, world</p>
    </div>
)
MiniReact.render(element, container)
*/