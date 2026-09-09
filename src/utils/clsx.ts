type ClassValue = string | number | null | undefined | false | ClassDictionary | ClassValue[];

interface ClassDictionary {
  [id: string]: unknown;
}

export function clsx(...args: ClassValue[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === "string") {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      const inner = clsx(...arg);
      if (inner) classes.push(inner);
    } else if (typeof arg === "object") {
      for (const key in arg as ClassDictionary) {
        if ((arg as ClassDictionary)[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
}
