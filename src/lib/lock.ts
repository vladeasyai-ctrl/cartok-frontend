/** Очередь на одно файловое хранилище, чтобы два запроса не перезаписали друг друга. */
export function createLock() {
  let tail: Promise<void> = Promise.resolve();

  return function locked<T>(task: () => Promise<T>): Promise<T> {
    const run = tail.then(task, task);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
}
