const OutputView = {
  printWelcome(): void {
    console.log("======= 시청가능한 영상 목록 =======");
  },

  printMenu(items: any[], selectedIndex: number): void {
    console.clear();
    this.printWelcome();

    if (items.length === 0) {
      console.log("시청가능한 영상 목록이 존재하지 않습니다.");
      return;
    }

    items.forEach((item, index) => {
      const prefix = index === selectedIndex ? "> " : "  ";
      const text = item.text ? item.text : item;
      console.log(`${prefix}${text}`);
    });

    console.log("\n(화살표를 이용해 움직일 수 있습니다, 엔터를 이용해 시청)");
  },

  printMessage(message: string): void {
    console.log(message);
  },

  printError(error: any): void {
    console.error(error);
  },
};

export default OutputView;
