function createElement (type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === 'object'
                    ? child
                    : createTextElement(child))
        }
    }
}
function createTextElement (text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

/**
 * for each fiber:
 * 1. add the element to the DOM
 * 2. create the fibers for the element's children
 * 3. select the next unit of work
 */

const isEvent = key => key.substring(0, 2) === 'on'
const isProperty = key => key !== 'children' && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

function createDom (fiber) {
    const dom =
        fiber.type === 'TEXT_ELEMENT'
            ? document.createTextNode(fiber.props.nodeValue)
            : document.createElement(fiber.type)
    Object.keys(fiber.props)
        .filter(isEvent)
        .forEach(name => {
            dom[name.toLowerCase()] = fiber.props[name]
        })
    Object.keys(fiber.props)
        .filter(isProperty)
        .filter(key => !isEvent(key))
        .forEach(name => {
            dom[name] = fiber.props[name]
        })
    return dom
}

function updateDom (dom, prevProps, nextProps) {
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key => 
                isGone(prevProps, nextProps) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        })
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ''
        })
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })
}

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let deletions = null

function render (element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot
    }
    deletions = []
    nextUnitOfWork = wipRoot
}

function commitRoot () {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork (fiber) {
    if (!fiber) {
        return
    }
    let domParentFiber = fiber.parent
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber.dom

    if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === 'DELETION') {
        commitDeletion(fiber, domParent)
        // commitWork(fiber.sibling)
        // return
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    }

    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function commitDeletion (fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent)
    }
}

function workLoop (deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork (fiber) {
    if (fiber.type instanceof Function) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

function updateFunctionComponent (fiber) {
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function updateHostComponent (fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    const elements = fiber.props.children
    reconcileChildren(fiber, elements)
}

function reconcileChildren (wipFiber, elements) {
    let prevSibling = null
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let i = 0

    while (i < elements.length || oldFiber) {
        const e = elements[i]
        let newFiber = null
        
        const sameType = oldFiber && e && e.type === oldFiber.type

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: e.props,
                parent: wipFiber,
                dom: oldFiber.dom,
                alternate: oldFiber,
                effectTag: 'UPDATE'
            }
        }
        if (e && !sameType) {
            newFiber = {
                type: e.type,
                props: e.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT'
            }
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = 'DELETION'
            deletions.push(oldFiber)
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
        if (i === 0) {
            wipFiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber

        i++
    }
}

const MiniReact = {
    createElement,
    render
}

/** @jsx MiniReact.createElement */
function App(props) {
    return <h1>Hello, {props.name}</h1>
}
const element = <App name="world" />
const container = document.getElementById('app')
MiniReact.render(element, container)

/*
const container = document.getElementById('app')

const updateValue = e => {
    rerender(e.target.value)
}

const rerender = value => {
    const element = (
        <div>
            <input onInput={updateValue} value={value} />
            <h2>Hello, {value}</h2>
        </div>
    )
    MiniReact.render(element, container)
}
rerender('World')
*/

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