import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  const { type, shapeFlags } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;

    default:
      if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }

      break;
  }
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent);
}

function processText(vnode, container) {
  const { children } = vnode;
  let textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function mountElement(vnode, container, parentComponent) {
  const { type, children, shapeFlags } = vnode;
  let el = (vnode.el = document.createElement(type));

  if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
  }

  const { props } = vnode;
  for (const key in props) {
    const value = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  container.append(el);
}

function mountChildren(vnode, el, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, el, parentComponent);
  });
}

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVnode, container, parentComponent) {
  const instance = createComponentInstance(initialVnode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container, instance);

  initialVnode.el = subTree.el;
}
