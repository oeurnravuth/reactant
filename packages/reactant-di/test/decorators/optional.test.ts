import { injectable, createContainer, optional, Optional } from '../..';

describe('@optional', () => {
  test('implicit identifier by default', () => {
    @injectable()
    class Foo {
      public get test() {
        return 'test';
      }
    }

    @injectable()
    class Bar {
      constructor(@optional() public foo: Foo) {}
    }

    @injectable()
    class FooBar {
      constructor(public bar: Bar) {}
    }

    const fooBar = createContainer({
      ServiceIdentifiers: new Map(),
    }).get(FooBar);
    expect(fooBar.bar instanceof Bar).toBeTruthy();
    expect(fooBar.bar.foo).toBeUndefined();
  });

  test('implicit identifier and inject', () => {
    @injectable()
    class Foo {}

    @injectable()
    class Bar {
      constructor(@optional() public foo: Foo) {}
    }

    @injectable()
    class FooBar {
      constructor(public bar: Bar) {}
    }

    const fooBar = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [Foo],
    }).get(FooBar);
    expect(fooBar.bar instanceof Bar).toBeTruthy();
  });

  test('mix - resolve other non-optional, auto inject for optional', () => {
    @injectable()
    class Foo0 {}

    @injectable()
    class Foo {
      constructor(public foo0: Foo0) {}
    }

    @injectable()
    class Bar {
      constructor(@optional() public foo: Foo) {}
    }

    @injectable()
    class FooBar {
      constructor(public bar: Bar) {}
    }

    const fooBar = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [Foo],
    }).get(FooBar);
    expect(fooBar.bar.foo.foo0 instanceof Foo0).toBeTruthy();
  });

  test('mix - without injectable decorator', () => {
    @injectable()
    class Foo {}

    class Foo1 {}

    @injectable()
    class Bar {
      constructor(@optional() public foo: Foo) {}
    }

    @injectable()
    class FooBar {
      constructor(public bar: Bar) {}
    }

    const fooBar = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [{ provide: Foo, useClass: Foo1 }],
    }).get(FooBar);
    expect(fooBar.bar.foo instanceof Foo1).toBeTruthy();
  });

  test('inheritance', () => {
    @injectable()
    class Foo {}

    @injectable()
    class Foo1 {}

    @injectable()
    class Bar {
      constructor(@optional() public foo: Foo) {}
    }

    @injectable()
    class Bar1 extends Bar {
      constructor(@optional() public foo: Foo, @optional() public foo1: Foo1) {
        super(foo);
      }
    }
    let bar1: Bar1;
    bar1 = createContainer({
      ServiceIdentifiers: new Map(),
    }).get(Bar1);

    expect(bar1.foo).toBeUndefined();
    expect(bar1.foo1).toBeUndefined();

    bar1 = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [Foo],
    }).get(Bar1);

    expect(bar1.foo instanceof Foo).toBeTruthy();
    expect(bar1.foo1).toBeUndefined();

    bar1 = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [Foo, Foo1],
    }).get(Bar1);

    expect(bar1.foo instanceof Foo).toBeTruthy();
    expect(bar1.foo1 instanceof Foo1).toBeTruthy();
  });

  test('resolve other module require', () => {
    @injectable()
    class Foo {}

    @injectable()
    class Bar {
      constructor(@optional('foo') public foo?: Foo) {}
    }

    @injectable()
    class FooBar {
      constructor(public bar: Bar, public foo: Foo) {}
    }

    const fooBar = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [],
    }).get(FooBar);
    expect(fooBar.bar.foo instanceof Foo).toBeFalsy();
    expect(fooBar.foo instanceof Foo).toBeTruthy();
  });

  test('string identifier and resolve other module require', () => {
    @injectable()
    class Foo {}

    @injectable()
    class Bar {
      constructor(@optional('foo') public foo?: Foo) {}
    }

    @injectable()
    class FooBar {
      constructor(public bar: Bar, public foo: Foo) {}
    }

    const fooBar = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [{ provide: 'foo', useClass: Foo }],
    }).get(FooBar);
    expect(fooBar.bar.foo === fooBar.foo).toBeFalsy();
    expect(fooBar.foo instanceof Foo).toBeTruthy();
    expect(fooBar.bar.foo instanceof Foo).toBeTruthy();
  });

  test('mix - resolve optional and require ', () => {
    @injectable()
    class Foo {}

    @injectable()
    class Bar {
      constructor(@optional() public foo: Foo) {}
    }

    @injectable()
    class Bar1 {
      constructor(@optional() public foo: Foo) {}
    }

    @injectable()
    class FooBar {
      constructor(public bar: Bar, public bar1: Bar1, public foo: Foo) {}
    }

    const fooBar = createContainer({
      ServiceIdentifiers: new Map(),
      modules: [{ provide: Bar, deps: [new Optional(Foo)] }],
    }).get(FooBar);
    expect(fooBar.bar.foo).toBeUndefined();
    expect(fooBar.foo instanceof Foo).toBeTruthy();
    expect(fooBar.bar1 instanceof Bar1).toBeTruthy();
  });
});
