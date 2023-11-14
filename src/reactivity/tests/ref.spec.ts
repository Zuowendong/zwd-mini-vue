import { effect } from "../effect";
import { ref } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const original = ref(1);
    expect(original.value).toBe(1);
  });

  it("should be reactive", () => {
    let data = ref(1);
    let dummy;
    let calls = 0;

    effect(() => {
      calls++;
      dummy = data.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);

    data.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);

    data.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it("should make nested properties reactive", () => {
    let data = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = data.value.count;
    });
    expect(dummy).toBe(1);
    data.value.count = 2;
    expect(dummy).toBe(2);
  });
});
