import { hasChanged, isObject } from "../shared/index";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    this.rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    if (isTracking()) {
      trackEffects(this.dep);
    }
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this.rawValue)) {
      this.rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}
export function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unref(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
