import { AxiosInstance, AxiosResponse } from "axios";

class Lecture {
  public lectureId: string;
  public seq: string;
  public type: string;
  public text: string;
  public weekNo?: string;
  public itemId?: string;
  public contentId?: string;
  public organizationId?: string;
  public ud?: string;
  public navi?: string;
  public link_seq?: string;
  public his_no?: string;
  public lectureWeeks?: string;
  private axiosInstance: AxiosInstance;
  private lmsUrl: string;

  constructor(
    lectureId: string,
    seq: string,
    type: string,
    text: string,
    axiosInstance: AxiosInstance,
    lmsUrl: string,
    weekNo?: string,
    itemId?: string,
    contentId?: string,
    organizationId?: string,
    ud?: string,
    navi?: string,
    link_seq?: string,
    his_no?: string,
    lectureWeeks?: string
  ) {
    this.axiosInstance = axiosInstance;
    this.lmsUrl = lmsUrl;
    this.lectureId = lectureId;
    this.seq = seq;
    this.type = type;
    this.text = text;
    this.weekNo = weekNo;
    this.itemId = itemId;
    this.contentId = contentId;
    this.organizationId = organizationId;
    this.ud = ud;
    this.navi = navi;
    this.link_seq = link_seq;
    this.his_no = his_no;
    this.lectureWeeks = lectureWeeks;
  }

  async goLecture(): Promise<AxiosResponse> {
    const url = this.lmsUrl + "/ilos/lo/st_room_auth_check2.acl";
    let data = "returnData=json&ky=" + this.lectureId + "&encoding=utf-8";

    console.log(`${this.text}과목 ${url}로 요청중...`);

    try {
      await this.axiosInstance.post(url, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      });

      const response = await this.axiosInstance.get(
        "https://lms.pknu.ac.kr/ilos/mp/todo_list_connect.acl?SEQ=" +
          this.seq +
          "&gubun=lecture_weeks&KJKEY=" +
          this.lectureId
      );

      return response;
    } catch (error) {
      console.error("Error sending go lecture request:", error);
      throw error;
    }
  }

  async sendOnlineViewRequest(): Promise<{
    navi: string;
    itemId: string;
    contentId: string;
    organizationId: string;
    lectureWeeks: string;
    ky: string;
    ud: string;
    force: string;
  } | null> {
    const url = this.lmsUrl + "/ilos/st/course/online_view_form.acl";
    const data = {
      lecture_weeks: this.seq,
      WEEK_NO: this.weekNo || "",
      _KJKEY: this.lectureId,
      kj_lect_type: "1",
      item_id: "",
      force: "",
    };

    console.log(`${this.text}과목 ${url}로 요청중...`);

    try {
      const response = await this.axiosInstance.post(url, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const match = response.data.match(
        /cv\.load\("([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\)/
      );
      if (match) {
        const [
          ,
          navi,
          itemId,
          contentId,
          organizationId,
          lectureWeeks,
          ky,
          ud,
          force,
        ] = match;

        this.navi = navi;
        this.itemId = itemId;
        this.contentId = contentId;
        this.organizationId = organizationId;
        this.ud = ud;
        this.lectureWeeks = lectureWeeks;

        return {
          navi,
          itemId,
          contentId,
          organizationId,
          lectureWeeks,
          ky,
          ud,
          force,
        };
      }
      return null;
    } catch (error) {
      console.error("Error sending online view request:", error);
      throw error;
    }
  }

  async sendOnlineViewNavi(): Promise<any> {
    const url = this.lmsUrl + "/ilos/st/course/online_view_navi.acl";
    const data = {
      content_id: this.contentId || "",
      organization_id: this.organizationId || "",
      lecture_weeks: this.seq,
      navi: this.navi || "",
      item_id: this.itemId || "",
      ky: this.lectureId,
      ud: this.ud || "",
      returnData: "json",
      encoding: "utf-8",
    };

    console.log(`${this.text}과목 ${url}로 요청중...`);

    try {
      const response = await this.axiosInstance.post(url, data, {
        headers: {
          accept: "*/*",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      });

      this.link_seq = response.data.link_seq;

      return response.data;
    } catch (error) {
      console.error("Error sending online view navi request:", error);
      throw error;
    }
  }

  async sendOnlineViewHisNo(): Promise<any> {
    const url = this.lmsUrl + "/ilos/st/course/online_view_hisno.acl";
    const data = {
      lecture_weeks: this.lectureWeeks || "",
      item_id: this.itemId || "",
      link_seq: this.link_seq || "",
      kjkey: this.lectureId,
      _KJKEY: this.lectureId,
      ky: this.lectureId,
      ud: this.ud || "",
      interval_time: "240",
      returnData: "json",
      encoding: "utf-8",
    };

    console.log(`${this.text}과목 ${url}로 요청중...`);

    try {
      const response = await this.axiosInstance.post(url, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      this.his_no = response.data.his_no;

      return response.data;
    } catch (error) {
      console.error("Error sending online view hisno request:", error);
      throw error;
    }
  }

  async sendOnlineViewAt(): Promise<any> {
    const url = this.lmsUrl + "/ilos/st/course/online_view_at.acl";
    const data = {
      lecture_weeks: this.lectureWeeks,
      item_id: this.itemId || "",
      link_seq: this.link_seq || "",
      his_no: this.his_no || "",
      ky: this.lectureId,
      ud: this.ud || "",
      trigger_yn: "N",
      interval_time: "240",
      returnData: "json",
      encoding: "utf-8",
    };

    console.log(`${this.text}과목 ${url}로 요청중...`);

    try {
      const response = await this.axiosInstance.post(url, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error sending online view at request:", error);
      throw error;
    }
  }

  async checkIsWatched(): Promise<string> {
    const response = await this.axiosInstance.post(
      this.lmsUrl + "/ilos/st/course/online_view_status.acl",
      {
        lecture_weeks: this.lectureWeeks,
        item_id: this.itemId || "",
        link_seq: this.link_seq || "",
        his_no: this.his_no,
        ky: this.lectureId,
        ud: this.ud || "",
        returnData: "json",
        encoding: "utf-8",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );
    return response.data.attend_stat;
  }
}

export default Lecture;
