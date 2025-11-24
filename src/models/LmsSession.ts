import axios, { AxiosInstance, AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import Lecture from "./Lecture.js";

interface TodoItem {
  lectureId: string;
  seq: string;
  type: string;
  text: string;
  weekNo?: string;
}

class LmsSession {
  private lmsUrl: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.lmsUrl = "https://lms.pknu.ac.kr";
    this.axiosInstance = wrapper(
      axios.create({
        jar: new CookieJar(),
      } as any)
    );
  }

  async init(): Promise<void> {
    //init jsessionid
    await this.axiosInstance.get(this.lmsUrl + "/ilos/main/main_form.acl");
  }

  async login(username: string, password: string): Promise<AxiosResponse> {
    const url = this.lmsUrl + "/ilos/lo/login.acl";
    const data = {
      returnURL: "",
      challenge: "",
      response: "",
      usr_id: username,
      usr_pwd: password,
    };

    try {
      const response = await this.axiosInstance.post(url, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response;
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  }

  async getTodoList(): Promise<Lecture[]> {
    await this.axiosInstance.get(this.lmsUrl + "/ilos/main/main_form.acl");

    const todoList = await this.axiosInstance.post(
      this.lmsUrl + "/ilos/mp/todo_list.acl",
      {
        todoKjList: "",
        chk_cate: "ALL",
        encoding: "utf-8",
      }
    );

    const $ = cheerio.load(todoList.data);

    const todoItems: TodoItem[] = $(".todo_wrap")
      .map((i, el) => {
        const onclick = $(el).attr("onclick");
        const match = onclick?.match(
          /goLecture\('([^']*)','([^']*)','([^']*)'\)/
        );
        if (match) {
          return {
            lectureId: match[1],
            seq: match[2],
            type: match[3],
            text: $(el).find(".todo_title").text().trim(),
          };
        }
        return null;
      })
      .get()
      .filter(
        (item): item is TodoItem =>
          item !== null && item.type === "lecture_weeks"
      );

    const lectures = todoItems.map(
      (item) =>
        new Lecture(
          item.lectureId,
          item.seq,
          item.type,
          item.text,
          this.axiosInstance,
          this.lmsUrl
        )
    );

    for (const item of todoItems) {
      const response = await this.axiosInstance.get(
        this.lmsUrl +
          "/ilos/mp/todo_list_connect.acl?SEQ=" +
          item.seq +
          "&gubun=lecture_weeks&KJKEY=" +
          item.lectureId
      );
      const $ = cheerio.load(response.data);
      const scriptContent = $("script").text();
      const weekNoMatch = scriptContent.match(/WEEK_NO=(\d+)/);
      if (weekNoMatch && weekNoMatch[1]) {
        item.weekNo = weekNoMatch[1];
      }
    }

    for (const lecture of lectures) {
      const response = await this.axiosInstance.get(
        this.lmsUrl +
          "/ilos/mp/todo_list_connect.acl?SEQ=" +
          lecture.seq +
          "&gubun=lecture_weeks&KJKEY=" +
          lecture.lectureId
      );
      const $ = cheerio.load(response.data);
      const scriptContent = $("script").text();
      const weekNoMatch = scriptContent.match(/WEEK_NO=(\d+)/);
      if (weekNoMatch && weekNoMatch[1]) {
        (lecture as any).weekNo = weekNoMatch[1];
      }
    }

    return lectures;
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  getLmsUrl(): string {
    return this.lmsUrl;
  }
}

export default LmsSession;
