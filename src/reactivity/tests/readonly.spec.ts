import { isReadonly, readonly, isProxy } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wapper = readonly(original);

    expect(wapper).not.toBe(original);
    expect(wapper.foo).toBe(1);

    expect(isReadonly(wapper)).toBe(true);
    expect(isReadonly(original)).toBe(false);

    expect(isReadonly(wapper.bar)).toBe(true);

    expect(isProxy(wapper)).toBe(true);
  });

  it("should call console warn when call set", () => {
    console.warn = jest.fn();
    const original = readonly({ foo: 1 });
    original.foo = 2;

    expect(console.warn).toHaveBeenCalled();
  });
});
