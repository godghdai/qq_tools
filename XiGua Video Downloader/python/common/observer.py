class Observer:
    def __init__(self):
        self.__events = {}

    def on(self, event: str, func):
        if event not in self.__events:
            self.__events[event] = []

        self.__events[event].append(func)

    def remove_listener(self, event: str, func):
        self.__events[event].remove(func)

    def emit(self, event: str, *arg):
        if event in self.__events:
            for func in self.__events[event]:
                func(*arg)


if __name__ == '__main__':
    obs = Observer()
    pp = lambda x, y: print(x + "---", y)
    obs.on("data", lambda x, y: print(x, y))
    obs.on("data", pp)
    obs.emit("data", "hello", "world")
    obs.remove_listener("data", pp)
    obs.emit("data", "hello", "world")
