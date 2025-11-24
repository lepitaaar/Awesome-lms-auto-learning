import LmsSession from "../models/LmsSession.js";
import OutputView from "../views/OutputView.js";
import InputView from "../views/InputView.js";
import Lecture from "../models/Lecture.js";

class AppController {
  private lmsSession: LmsSession;
  private selectedIndex: number;
  private menuItems: (string | Lecture)[];

  constructor() {
    this.lmsSession = new LmsSession();
    this.selectedIndex = 0;
    this.menuItems = [];
  }

  async run(): Promise<void> {
    await this.lmsSession.init();
    const id = await InputView.readLine("아이디를 입력하세요: ");
    const password = await InputView.readPassword("비밀번호를 입력하세요: ");
    await this.lmsSession.login(id, password);

    const todoItems = await this.lmsSession.getTodoList();

    if (todoItems.length === 0) {
      OutputView.printMenu([], 0);
      process.exit(1);
    }

    this.menuItems = ["전체 시청", ...todoItems];
    this.renderMenu();

    this.handleInput();
  }

  renderMenu(): void {
    OutputView.printMenu(this.menuItems, this.selectedIndex);
  }

  handleInput(): void {
    InputView.readKey(async (action) => {
      if (action.type === "move") {
        if (action.direction === "up") {
          this.selectedIndex =
            (this.selectedIndex - 1 + this.menuItems.length) %
            this.menuItems.length;
        } else if (action.direction === "down") {
          this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
        }
        this.renderMenu();
      } else if (action.type === "select") {
        const selectedItem = this.menuItems[this.selectedIndex];
        if (selectedItem === "전체 시청") {
          await this.startWatching(this.menuItems.slice(1) as Lecture[]);
        } else {
          await this.startWatching([selectedItem as Lecture]);
        }
      }
    });
  }

  async startWatching(todoItems: Lecture[]): Promise<void> {
    for (const item of todoItems) {
      await item.goLecture();

      while (true) {
        await item.sendOnlineViewRequest();

        await item.sendOnlineViewNavi();

        await item.sendOnlineViewHisNo();

        await item.sendOnlineViewAt();

        const currentStatus = await item.checkIsWatched();

        //이미 시청끝난 시청 세션에 시간 보간 요청 재전송하면 시간이 4분씩 증가하는 취약점 존재
        await item.sendOnlineViewAt();

        if (currentStatus === "2") {
          OutputView.printMessage(`${item.text} 시청완료`);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    process.exit(0);
  }
}

export default AppController;
