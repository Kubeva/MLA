export function getFormDefaultValueType (type) {
    switch(type) {
      case "string": return "String";
      case "number": return 0;
      case "boolean": return false;
      case "array": return [1, 2, 3];
      case "object": return {a: 1, b: "c"};
    }
  }