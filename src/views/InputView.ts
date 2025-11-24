import readline from "readline";

const InputView = {
  readKey(callback: (key: { type: string; direction?: string }) => void): void {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onKeypress = (str: string, key: readline.Key) => {
      if (key.ctrl && key.name === "c") {
        process.exit();
      }

      if (key.name === "up") {
        callback({ type: "move", direction: "up" });
      } else if (key.name === "down") {
        callback({ type: "move", direction: "down" });
      } else if (key.name === "return") {
        process.stdin.removeListener("keypress", onKeypress);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        callback({ type: "select" });
      }
    };

    process.stdin.on("keypress", onKeypress);
  },

  readLine(query: string): Promise<string> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  },

  readPassword(query: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(query);
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      let password = "";

      const onKeypress = (str: string, key: readline.Key) => {
        if (key.ctrl && key.name === "c") {
          process.exit();
        }

        if (key.name === "return") {
          process.stdin.removeListener("keypress", onKeypress);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(password);
        } else if (key.name === "backspace") {
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          password += str;
          process.stdout.write("*");
        }
      };

      process.stdin.on("keypress", onKeypress);
    });
  },
};

export default InputView;
