import React, { useState, CSSProperties, useRef, useEffect } from "react";
import axios from "axios";
import { WEB_INFO } from '../const';
import ACC_SHEET_API from '../credentials.json';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import moment from 'moment';
import myData from '../data.json';

import DataTable, { createTheme } from 'react-data-table-component';
const LOCAL_STORAGE_KEY = "BP_TASK_LIST_PNT";

// createTheme creates a new theme named solarized that overrides the build in dark theme
createTheme('solarized', {
  text: {
    primary: '#268bd2',
    secondary: '#2aa198',
  },
  background: {
    default: '#ffffff',
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF',
  },
  divider: {
    default: '#dcdcdc',
  },
  action: {
    button: 'rgba(0,0,0,.54)',
    hover: 'rgba(0,0,0,.08)',
    disabled: 'rgba(0,0,0,.12)',
  },
}, 'light');

  
export default function BPTableGridNew (props) {
   let [reqDetail, setReqDetail] = useState({});
  // let [reqId, setReqId] = useState("");
  const url = 'https://blueprint.cyberlogitec.com.vn/api';
  let [sprintNumber, setSprintNumber] = useState("");
  let [clickID, setClickID] = useState("");
  let [config, setConfig] = useState({
    isLoadGoogleSheet: true,
    WORKING_API: WEB_INFO.WORKING_API,
    TASK_MEMBER_API: WEB_INFO.TASK_MEMBER_API
  });

  const SHEET_ID = "Member_List";
  const RANGE_MEMBER_SHEET = 'A1:AQ50';
  const SPREADSHEET_ID = "10WPahmoB6Im1PyCdUZ_uda3fYijC8jKtHnRBasnTK3Y";
  const MGMT_TASK_SHEET_ID = "NEW_FWD_TEAMB_TASKS";
  const MGMT_TASK_RANGE_MEMBER_SHEET = 'A1:AO';
  const MGMT_TASK_SPREADSHEET_ID = "1jsBbrJZ8AYuNTRiBMLfcngHi0f6vCF1XocbvvpJDBAM";
  let [isShowDetailEffortTable, setIsShowDetailEffortTable] = useState(true);
  let [isCheckEffort, setIsCheckEffort] = useState(false);
  let [isCurrentMonth, setIsCurrentMonth] = useState(true);
  const today = moment(new Date());
  const firstDayOfMonth = today.clone().startOf("month");
  const [startDate, setStartDate] = useState(firstDayOfMonth._d);
  const [endDate, setEndDate] = useState(new Date());
  const [memberList, setMemberList] =  useState({});
  let [taskInfo, setTaskInfo] = useState({});
  let [effortInfo, setEffortInfo] = useState({});
  let [effortWithMember, setEffortWithMember] = useState([]);
  let [memberTaskList, setMemberTaskList] = useState({});
  const taskLevelList = myData.taskLevel;
  const defaultTrongSo = taskLevelList[0];
  const [taskLevel, setTaskLevel] = useState(taskLevelList[0]);
  const [onlySubmit, setOnlySubmit] = useState(false);

  const [todoList, setTodoList] = useState(() => {
    console.log("use");
    return props.data;
  });
    
  useEffect(() => {
    console.log("use");
    // localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todoList));
    setTodoList(props.data);
  }, [todoList]);


  const columns = [
    {
      name: 'ID',
      width: "50px",
      center: "yes",
      selector: row => row.seqNo,
      cell: row => (
        <span>
          {row.index + 1}
        </span>
      ),
    },
    {
        name: 'Seq',
        width: "50px",
        center: "yes",
        selector: row => row.seqNo,
        cell: row => (
          <a href={`https://blueprint.cyberlogitec.com.vn/UI_PIM_001_1/${row.reqId}`} target="_blank" rel="noopener noreferrer">
            {row.seqNo}
          </a>
        ),
    },
    {
      name: 'Effort',
      width: "90px",
      center: "yes",
      cell: row => (
        <button 
          class='bg-blue-500 text-white py-2 px-4 rounded-lg ml-4' 
          onClick={event => {
            const url = `https://blueprint.cyberlogitec.com.vn/UI_PIM_001_1/${row.reqId}`;
            let enabledMgmt = false;
            let enabled = true;
            window['chrome'].storage?.local.set({enabledMgmt});
            window['chrome'].storage?.local.set({enabled});
        
            var win = window.open(url, "ADD POINT", "width="+screen.availWidth+",height="+screen.availHeight); //to open new page
            // win.searchRequirement();
            // searchRequirement
          }}>
           (+) {row.pntNo}
        </button>
      ),
    },
    {
      name: 'Imp Eff.',
      width: "90px",
      center: "yes",
      cell: row => (
        row.impl_effort ? row.impl_effort : 0
      ),
    },
    {
      name: 'Tester Eff.',
      width: "90px",
      center: "yes",
      cell: row => (
        row.impl_test ? row.impl_test : 0
        
      ),
    },
    {
      name: 'Title',
      width: "300px",
      allowOverflow: "no",
      wrap: "yes",
      selector: row => row.reqTitNm,
    },
    {
      name: 'Job Name',
      width: "110px",
      selector: row => row.jbTpNm,
    },
    {
      name: 'PIC',
      width: "120px",
      wrap: "yes",
      selector: row => row.assignee,
    },
    {
      name: 'Pharse',
      width: "90px",
      wrap: "yes",
      selector: row => row.reqPhsNm,
    },
    {
      name: 'Created User',
      width: "120px",
      wrap: "yes",
      selector: row => row.createUser,
      
    },
    
  ];

  const conditionalRowStyles = [
    // {
    //   when: row => row.calories < 300,
    //   style: {
    //     backgroundColor: 'green',
    //     color: 'white',
    //     '&:hover': {
    //       cursor: 'pointer',
    //     },
    //   },
    // },
    // You can also pass a callback to style for additional customization
    {
      when: row => row.pntNo <= 30,
      style: row => ({ backgroundColor: 'pink' }),
    },
  ];

  const workday_count = (start, end) => {
    var first = start.clone().endOf("week"); // end of first week
    var last = end.clone().startOf("week"); // start of last week
    var days = (last.diff(first, "days") * 5) / 7; // this will always multiply of 7
    var wfirst = first.day() - start.day(); // check first week
    if (start.day() == 0) --wfirst; // -1 if start with sunday
    var wlast = end.day() - last.day(); // check last week
    if (end.day() == 6) --wlast; // -1 if end with saturday
    var holidays = count_holiday(start, end);
    return wfirst + Math.floor(days) + wlast - holidays; // get the total
  };   
  const sumEfrtKnt = (arr) => {
    let sum = 0;
    for(let i = 0; i < arr.length; i ++){
      sum += arr[i].efrtKnt;
    }
    return sum;
  }
  const NaNToZero = (value: any) => {
    let val = 0;
    try {
      console.log("NaNToZero", value);
      if(value) {
        val =  parseFloat(value);
      } 
    } catch (error) {
      return 0;
    }

    return val;
  }
  async function getDailyTasksByUser(ro) {
    
    console.log("RO", ro);

    // console.log("reqee", req)
    const response = await axios.post(`${url}/uiPim026/getDailyTasksByUser`, ro)
      .then(async function (response) {
        return response.data;
    });

  
    // console.log("response", response);
    return new Promise((resolve, reject) => {
        resolve(response);
    });
  }
  

  const reqClickupIinfoSplit = (req) => {
    let clickupId = "";
    let sprint:any;
    if(req && req.lstReq && req.lstReq.length > 0){
      
      let reqName = req.lstReq[0].reqTitNm;

      var chuoi = reqName;
      var pattern = /\[(.*?)\]/g;
      var ketQua = chuoi.match(pattern);
      let newArr:any = [];
      ketQua.forEach((item) => {
        let str:any = item.replace(/[\[\]']+/g,'');
        newArr.push(str);
      });
      if (ketQua) {
        console.log("newArr", ketQua); // ["New US FWD", "Thuan Lai", "Team B", "DEV-TEST:5P-2P", "865cg6601", "Sprint 27"]
      } else {
        console.log("Không tìm thấy chuỗi nằm trong dấu [ ] trong đoạn văn bản.");
      }
      //Find clickup ID
      let clickupIDByLength:any = "";
      newArr.forEach((item) => {
        if(item.replace(/ /g, "").length == 9) {
          clickupIDByLength = item.replace(/ /g, "");
          return;
        }
      });

      if(reqName) {
        if(ketQua && ketQua.length > 4) {
          let id = newArr[4].replace(/ /g, "");
          if(id.includes("865")) {
            clickupId = id;

          } else {
            if(clickupIDByLength.includes("865")) {
              clickupId = clickupIDByLength;
            } else {
              alert("KHÔNG TÌM DC CLICKUP ID: ", newArr.join("_"));
            }
          }
          
          // for(let i = 0; i < newArr.length; i ++) {
          //   if(newArr[i].contains)
          // }
          
          let findSprint = newArr.filter(e => e.includes("Sprint"));
         
          if(findSprint && findSprint.length > 0) {
            let arr = findSprint[0].split(" ");
            if(arr.length > 1) {
              sprint = arr[1];

            } else {
              sprint = findSprint[0].replace(/[^0-9]+/g, '');
            }
          }
          setSprintNumber(sprint);
          setClickID(clickupId);
         
        }
      }
      
      return {
        clickupId: clickupId,
        sprint: sprint
      }
    }
  }

  function sumEffort (lsData, userId, phsCd) {
    let sum = 0;
    for (let i = 0; i < lsData.length; i ++) {
      if(userId == lsData[i].usrId && phsCd == lsData[i].phsCd){
        sum += parseInt(lsData[i].actEfrtMnt);
      }
    }

    return sum;
  }

  const googleSheetProcessTask = async (NEW_FWD_TEAMB_TASKS, req) => {
    let taskList = [];
    //Get Task clickup
    // const sheet = doc.sheetsByTitle[MGMT_TASK_SHEET_ID]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    // console.log(sheet.title);
    // console.log(sheet.rowCount);
    // const range = MGMT_TASK_RANGE_MEMBER_SHEET; //'A1:AB50'
    // await sheet.loadCells(range); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
    let sheet = NEW_FWD_TEAMB_TASKS;
    let clickupId = "";
    let startdate = "";
    let enddate = "";
    let estHourDev = 0;
    let estHourTest = 0;
    if(req && req.lstReq && req.lstReq.length > 0){
      
      let reqName = req.lstReq[0].reqTitNm;

      var chuoi = reqName;
      var pattern = /\[(.*?)\]/g;
      var ketQua = chuoi.match(pattern);
      let newArr:any = [];
      ketQua.forEach((item) => {
        let str:any = item.replace(/[\[\]']+/g,'');
        newArr.push(str);
      });
      if (ketQua) {
        console.log("newArr", ketQua); // ["New US FWD", "Thuan Lai", "Team B", "DEV-TEST:5P-2P", "865cg6601", "Sprint 27"]
      } else {
        console.log("Không tìm thấy chuỗi nằm trong dấu [ ] trong đoạn văn bản.");
      }
      //Find clickup ID
      let idx = 4;
      let clickupIDByLength:any = "";
      newArr.forEach((item) => {
        if(item.replace(/ /g, "").length == 9) {
          clickupIDByLength = item.replace(/ /g, "");
          return;
        }
      });

      if(reqName) {
        if(ketQua && ketQua.length > 4) {
          let id = newArr[4].replace(/ /g, "");
          if(id.includes("865")) {
            clickupId = id;

          } else {
            if(clickupIDByLength.includes("865")) {
              clickupId = clickupIDByLength;
            } else {
              alert("KHÔNG TÌM DC CLICKUP ID: ", newArr.join("_"));
            }
          }
          let sprint:any;
          // for(let i = 0; i < newArr.length; i ++) {
          //   if(newArr[i].contains)
          // }
          
          let findSprint = newArr.filter(e => e.includes("Sprint"));
         
          if(findSprint && findSprint.length > 0) {
            let arr = findSprint[0].split(" ");
            if(arr.length > 1) {
              sprint = arr[1];

            } else {
              sprint = findSprint[0].replace(/[^0-9]+/g, '');
            }
          }
          setSprintNumber(sprint);
          setClickID(clickupId);
          console.log("Sprint", findSprint);
          if(clickupId){
            taskList = [];
            try {
              for(let i = 0; i < sheet.rowCount; i ++) {
                const sheetClickupId = sheet.getCell(i, 2); // access cells using a zero-based index
                const sheetStartDate = sheet.getCell(i, 11); // access cells using a zero-based index
                const sheetEndDate = sheet.getCell(i, 12); // access cells using a zero-based index
                const sheetSprint = sheet.getCell(i, 23); // access cells using a zero-based index
                const sheetEffortDev = sheet.getCell(i, 13); // access cells using a zero-based index
                const sheetEffortTest = sheet.getCell(i, 14); // access cells using a zero-based index
  
  
                if(sheetClickupId.formattedValue == clickupId
                  && sprint == sheetSprint.formattedValue) {
                      let mem = {
                          "sprint": sprint,
                          "effortdev": sheetEffortDev.formattedValue,
                          "efforttest": sheetEffortTest.formattedValue,
                          "startdate":sheetStartDate.formattedValue,
                          "enddate": sheetEndDate.formattedValue,
                          "clickupId":sheetClickupId.formattedValue,
                          
                          
                      }
                      taskList.push(mem);
                }
                
              }
            } catch (error) {
              console.log("sheet-each", error);
            }
            
          }
        }
      }
      // console.log("arrMember", arrMember);
      // return taskList;
      return new Promise((resolve, reject) => {
        resolve(taskList);
        console.log("Task End Time until everything loaded: ", Date.now()-timerStart);
      });

    }

  }
  const selectMember_TaskList = async (requirementRP) => {
    if(1 == 1) {
      //Call API
      let memberResponse = await axios.get(`${config.TASK_MEMBER_API}/memberList`)
      .then(async function (response) {
        let data =  response.data.data;
        
        return data;

      });

    
      let param = reqClickupIinfoSplit(requirementRP);
      let arrPms = [];
      let taskList: any;
      let memberPromise: any;
      if(param && param.clickupId) {
        let taskListResponse = await axios.get(`${config.TASK_MEMBER_API}/taskList/${param?.clickupId}/${param?.sprint}`)
        .then(async function (response) {
          const data =  response.data.data;
          return data;

        });
        
        taskList = await new Promise((resolve, reject) => {
          resolve(taskListResponse);
        });
      
      }

      memberPromise = await new Promise((resolve, reject) => {
        resolve(memberResponse);
      });

      return await Promise.all([taskList, memberPromise]).then((result) => {
        let arrMems = [];
        let arrMemResponse:any = result[1];

        

          let data = {
            arrMember: arrMemResponse,
            taskList: result[0]
          }
          // resolve(result);
          console.log("data", data);
          return data;
      });


    } else { //sheet
      var timerStart = Date.now();
    
      console.log("Time until DOMready: ", Date.now()-timerStart);
      let result = {
        arrMember: [],
        taskList: []
      };

      let arrMember = [];
      //Sheet Start
      // Initialize the sheet - doc ID is the long id in the sheets URL
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID); //script data
      // const doc = new GoogleSpreadsheet('16S2LDwOP3xkkGqXLBb30Pcvvnfui-IPJTXeTOMGCOjk');

      
      
      // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
      await doc.useServiceAccountAuth({
        // env var values are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        client_email:  ACC_SHEET_API.client_id,
        private_key: ACC_SHEET_API.private_key,
      });
      await doc.loadInfo(); // loads document properties and worksheets
      console.log("LOAD", doc.title);
      // setDocTitle(doc.title);

      const Member_List = doc.sheetsByTitle[SHEET_ID]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
      const NEW_FWD_TEAMB_TASKS = doc.sheetsByTitle[MGMT_TASK_SHEET_ID]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

      console.log(Member_List.title);
      console.log(Member_List.rowCount);
      const range = RANGE_MEMBER_SHEET; //'A1:AB50'
      await Member_List.loadCells(range); // loads range of cells into local cache - DOES NOT RETURN THE CELLS

      await NEW_FWD_TEAMB_TASKS.loadCells(MGMT_TASK_RANGE_MEMBER_SHEET); // loads range of cells into local cache - DOES NOT RETURN THE CELLS

      for(let i = 0; i < 50; i ++) {
        const empCode = Member_List.getCell(i, 0); // access cells using a zero-based index
        const userId = Member_List.getCell(i, 1); // access cells using a zero-based index
        const fullName = Member_List.getCell(i, 2); // access cells using a zero-based index
        const leaveTeam = Member_List.getCell(i, 26); // access cells using a zero-based index = sheet.getCell(i, 2); // access cells using a zero-based index
        // console.log("leaveTeam.formattedValue", leaveTeam.formattedValue);
        if(empCode.formattedValue != "" 
          && userId.formattedValue != "" 
          && fullName.formattedValue != ""
          && leaveTeam.formattedValue == "N") {
              let mem = {
                  "empCode":        Member_List.getCell(i, 0).formattedValue,
                  "userId":         Member_List.getCell(i, 1).formattedValue,
                  "fullName":       Member_List.getCell(i, 2).formattedValue,
                  "currentLevel":   Member_List.getCell(i, 3).formattedValue,
                  "lvlCode":        Member_List.getCell(i, 4).formattedValue,
                  "levelRating":    Member_List.getCell(i, 5).formattedValue,
                  "targetLevel":    Member_List.getCell(i, 6).formattedValue,
                  "tagartRating":   Member_List.getCell(i, 7).formattedValue,
                  "pointOnHour": {
                    "standard":   Member_List.getCell(i, 38).formattedValue,
                    "timeStandard":   Member_List.getCell(i, 39).formattedValue,
                    "expect":     Member_List.getCell(i, 9).formattedValue,
                    "description": Member_List.getCell(i, 10).formattedValue
                  },
                  "role":           Member_List.getCell(i, 11).formattedValue.split(","),
                  "workload":       Member_List.getCell(i, 12).formattedValue,
                  "pointStandard":  Member_List.getCell(i, 13).formattedValue, //FINISHE / RECEIVED
                  "teamLocal":      Member_List.getCell(i, 14).formattedValue.split(","),
                  "dedicated":      Member_List.getCell(i, 15).formattedValue,
                  "blueprint_id":   Member_List.getCell(i, 16).formattedValue,
                  "blueprint_nm":   Member_List.getCell(i, 17).formattedValue,
                  "clickup_id":     Member_List.getCell(i, 18).formattedValue,
                  "clickup_nm":     Member_List.getCell(i, 19).formattedValue,
                  "effectDateFrom": Member_List.getCell(i, 20).formattedValue,
                  "effectDateTo":   Member_List.getCell(i, 21).formattedValue,
                  "preReviewDate":  Member_List.getCell(i, 22).formattedValue,
                  "nextReviewDate": Member_List.getCell(i, 23).formattedValue,
                  "phone":          Member_List.getCell(i, 24).formattedValue,
                  "clvEmail":       Member_List.getCell(i, 25).formattedValue,
                  "leaveTeam":      Member_List.getCell(i, 26).formattedValue,
                  "leaveCompany":   Member_List.getCell(i, 27).formattedValue,
                  "maxLevelTaskGap":Member_List.getCell(i, 32).formattedValue,
                  "minPoint"        :Member_List.getCell(i, 33).formattedValue,
                  "maxPoint"        :Member_List.getCell(i, 34).formattedValue,
                  "target"        :Member_List.getCell(i, 36).formattedValue,
              }
              arrMember.push(mem);
        }
        
      }
      let memberPromise = new Promise((resolve, reject) => {
        resolve(arrMember);
      });

      let taskList:any = await googleSheetProcessTask(NEW_FWD_TEAMB_TASKS, requirementRP);
      
      return await Promise.all([memberPromise, taskList]).then((result) => {
          let data = {
            arrMember: result[0],
            taskList: result[1]
          }
          // resolve(result);
          console.log(result);
          console.log("Time until everything loaded: ", Date.now()-timerStart);
          return data;
      });

      // console.log("arrMember", arrMember);
      // return new Promise((resolve, reject) => {
      //   result = {
      //     arrMember: arrMember,
      //     taskList: taskList
      //   }
      //   resolve(result);
      //   console.log("Time until everything loaded: ", Date.now()-timerStart);
      // });
      
        
      //Sheet End
    }
  }
 
  const searchRequirement = async (event, rowData) => {
    console.log("searchRequirement", rowData);
    console.log("searchRequirement-reqId", rowData.reqId);
    console.log("searchRequirement-seqNo", rowData.seqNo);

    
    const reqId = rowData.reqId;
    const requirementDetail = await  axios.get(`${url}/searchRequirementDetails?reqId=${reqId}`)
    .then(async(res) => {
      setReqDetail(res.data);
      // selectMember_TaskList();
      let reqDetail = res.data;
      const data = {
        "pjtId": reqDetail.detailReqVO.pjtId,
          "reqNm": reqDetail.detailReqVO.reqTitNm,
          "advFlg": "N",
          "reqStsCd": [
              "REQ_STS_CDPRC",
              "REQ_STS_CDOPN"
          ],
          "jbTpCd": "_ALL_",
          "itrtnId": "_ALL_",
          "beginIdx": 0,
          "endIdx": 200,
          "picId": "",
          "isLoadLast": false,
          "pageSize": 25
      };
      let lsPharseMember = reqDetail.lstSkdUsr;
      let requirement = await axios.post(`${url}/uiPim001/searchRequirement`,   data
      ).then(async (res) => {
        let requirementRP = res.data;
        console.log("----------------lsMember");
        const detail = await axios.get(`${url}/task-details/get-actual-effort-point?reqId=${reqId}`)
          .then(async (res) => {
            let arrReq = [];
            // let result = await selectMember_TaskList(requirementRP);

            // await selectTaskList("A", requirementRP).then(async (result) => {
            await selectMember_TaskList(requirementRP).then(async (result) => {
              console.log("selectMember_TaskList");
              let taskSheet = result.taskList;
              let lsMember = result.arrMember;
             
              //         arrMember: [],
              // taskList: []
              // let taskGoogleSheet = await selectTaskList("A");
              // let newTask: any;
              // if(taskInfo && taskGoogleSheet.length > 0){
              //   newTask = {
              //     sheetTask: taskGoogleSheet[0]
              //   };
          
              // }
              // await Promise.resolve(selectMember_TaskList);
              let lsReq = res.data;
              let tmpResult = new Array();
              if(lsReq.lstActEfrtPnt != undefined && lsReq.lstActEfrtPnt != null && lsReq.lstActEfrtPnt.length > 0) {
               
                // let addedPoint = taskInfo.lstReq[0].pntNo;
                let currentTotalPoint = 0;
                for(let idx = 0; idx < lsPharseMember.length; idx ++){
                  let item = lsPharseMember[idx];
                  const userId = lsPharseMember[idx].usrId;
                  const phsCd =  lsPharseMember[idx].phsCd;
                  const member =  lsMember.find(mem => mem.userId == userId);
                  const total = sumEffort(lsReq.lstActEfrtPnt, userId, phsCd);

                  //set flag get point form estimate or actual
                  let isBurnPointEstimate = true;
                  let pointDefaultByPharse = {
                      "standard": 25,
                      "timeStandard": 0,
                      "expect": 19, //Jnr1
                      "description": ""
                  }
                  
                
                  if(member) {
                    pointDefaultByPharse =  member.pointOnHour;
                  }
                  let totalTask = total;
                  totalTask += parseInt(pointDefaultByPharse.timeStandard);

                  //Check in default
                  // let itemPointDefault = pointDefaultByPharse.filter(point => point.code == phsCd);
                  let standardPoint = 25;
                  let expectPoint = 25;
                  let isDevelopInSprint = false;
                  let isTestInSprint = false;
                  console.log("member", member);
                  if(member){
                    expectPoint = member.pointOnHour.expect;
                    standardPoint = member.pointOnHour.standard;
                    item.minPoint = member.minPoint;
                    item.maxPoint = member.maxPoint;
                    item.target = member.target;
                    item.averageeffortpoint_month = member.averageeffortpoint_month * parseFloat(member.workload);
                    item.pointinday = member.pointinday ? parseInt(member.pointinday) : 200;

                    if(isCheckEffort) {
                      // let reqParam = {
                      //   usrId: item.usrId,
                      //   effectDateFrom: member.effectDateFrom,
                      //   effectDateTo: member.effectDateTo
                      // }
                      let newStart = startDate;
                      // let newStart = startDate;
                      let effectDateFromORG =  moment(moment(member.effectDateFrom));
                      let effectDateToORG =  moment(moment(member.effectDateTo));

                      //Mặc định chỉ check effort trong tháng
                      if(!isCurrentMonth && member.effectDateFrom && member.effectDateTo) {
                        newStart = effectDateFromORG;
                      }
                      let ro = {
                        "usrId": item.usrId,
                        "fromDt": moment(newStart).format("YYYYMMDD"),
                        "toDt": moment(endDate).format("YYYYMMDD"),
                        "fromDtOrg": moment(newStart),
                        "toDtOrg": moment(endDate),
                      };
                    
                      const res = await getDailyTasksByUser(ro);
                      console.log("RES", res);
                      item.effortPoint = 0; // Waiting API
                      if(res){
                        const diffDays = workday_count (ro.fromDtOrg, ro.toDtOrg);
                        const diffMonth = moment(ro.toDtOrg._i).diff(moment(ro.fromDtOrg._i), 'months', true);
                        const totalMonth  = moment(effectDateToORG._i).diff(moment(effectDateFromORG._i), 'months', true);
                        const countMonth = diffMonth && diffMonth >= 1 ?  Math.round(diffMonth) : 1;
                        item.countMonth = countMonth;
                        item.totalMonth = Math.round(totalMonth);
                        item.effortPoint = sumEfrtKnt (res.dailyRsrcLst) / countMonth;
                        item.averageeffortpoint_days = diffDays * item.pointinday * parseFloat(member.workload);
                        item.totalDays = diffDays;
                      
                    
                      }
                    }
                  }

                  if(taskSheet && taskSheet.length > 0) { //Check status develop/dev in the sprint
                    isDevelopInSprint = (taskSheet[0].pic_dev && taskSheet[0].usp) ? true : false;
                    isTestInSprint = (taskSheet[0].pic_test && taskSheet[0].usp_test) ? true : false;
                    
                  }
                  
                  item.standardPoint = standardPoint;
                  item.expectPoint = expectPoint;
              
                  // console.log("ITEM_MEMBER", item);
                  // console.log("taskSheet", taskSheet);
                  // console.log("isDevelopInSprint", isDevelopInSprint);
                  // console.log("isTestInSprint", isTestInSprint);

                  if("PIM_PHS_CDREG" == phsCd){ 
                    //Check Neu la point default
                    item.effortHours =  parseInt(pointDefaultByPharse.timeStandard); //12min = 5 point
                    item.bpAdddpoint =  parseInt(pointDefaultByPharse.timeStandard);
                    item.point =  NaNToZero(parseInt(pointDefaultByPharse.timeStandard));

                    item.pointEST = NaNToZero(parseInt(pointDefaultByPharse.timeStandard));
                    item.pointACT = NaNToZero(parseInt(pointDefaultByPharse.timeStandard));
                    // parseFloat(pointDefaultByPharse.standard);
                  
                  } else {
                    if("PIM_PHS_CDIMP" == phsCd){ 
                      console.log("DEV ITEM -S");
                      let estByMember = 0;
                      estByMember = (taskSheet && taskSheet.length > 0) ? NaNToZero(taskSheet[0].effortdev) : 0;
                      item.estHours = estByMember * 60; //Hour

                      //Nêu task nhận trong sprint thì sẽ lấy thời gian EST tính effort point, ngược lại lấy thời gian log work tính effort point.
                      //IsEST = true

                      if(isDevelopInSprint) { //Task nhan develop trong sprint
                          let pointSuggest = estByMember > 0 ? estByMember : (total*1.0) / (60 * 1.0);
                          if(total > 0){
                            item.effortHours = total; 
                            item.point = NaNToZero(Math.ceil(parseFloat(pointSuggest) * expectPoint));
                            item.pointEST = Math.ceil(parseFloat(pointSuggest) * expectPoint);

                            //THEM BIEN DE TINH TOAN
                            item.pointACT = parseInt((total / (60 * 1.0)) * expectPoint);

                          } else {
                            item.effortHours = 0; 
                            item.point =  NaNToZero(Math.ceil(parseFloat(estByMember) * expectPoint));
                            item.pointEST = Math.ceil(parseFloat(estByMember) * expectPoint);
                            item.pointACT = 0;
                          }
                      } else {
                        item.effortHours = total; 
                        item.point = NaNToZero(parseInt((total / (60 * 1.0)) * expectPoint));
                        item.pointACT = parseInt((total / (60 * 1.0)) * expectPoint);

                        //THEM BIEN DE TINH TOAN
                        pointSuggest = estByMember > 0 ? estByMember : (total*1.0) / (60 * 1.0);
                        item.pointEST = Math.ceil(parseFloat(pointSuggest) * expectPoint);

                      }
                      console.log("DEV ITEM -S", item);
                    } else {
                      if("PIM_PHS_CDTSD" == phsCd){ 
                        console.log("TESTER ITEM -S");
                        let estByMember = 0;
                        estByMember = (taskSheet && taskSheet.length > 0) ? NaNToZero(taskSheet[0].efforttest) : 0;
  
                        item.estHours = estByMember * 60; //Hour

                        //Nêu task nhận trong sprint thì sẽ lấy thời gian EST tính effort point, ngược lại lấy thời gian log work tính effort point.
                        let pointSuggest = estByMember > 0 ? estByMember : (total*1.0) / (60 * 1.0);
                        if(isTestInSprint) { //Task nhan develop trong sprint
                          if(total > 0){
                            item.effortHours = total; 
                            item.point = NaNToZero(Math.ceil(parseFloat(pointSuggest) * expectPoint));

                            item.pointEST = Math.ceil(parseFloat(pointSuggest) * expectPoint);

                            //THEM BIEN DE TINH TOAN
                            item.pointACT = parseInt((total / (60 * 1.0)) * expectPoint);

                          } else {
                            item.effortHours = 0; 
                            item.point =  NaNToZero(Math.ceil(parseFloat(estByMember) * expectPoint));
                            item.pointEST = Math.ceil(parseFloat(estByMember) * expectPoint);
                            item.pointACT = 0;
                          }

                        } else {
                          item.effortHours = total; 
                          item.point = NaNToZero(parseInt((total / (60 * 1.0)) * expectPoint));
                          item.pointACT = parseInt((total / (60 * 1.0)) * expectPoint);

                        //THEM BIEN DE TINH TOAN
                          pointSuggest = estByMember > 0 ? estByMember : (total*1.0) / (60 * 1.0);
                          item.pointEST = Math.ceil(parseFloat(pointSuggest) * expectPoint);
                        }
                        console.log("TESTER ITEM",item);
                        
                      } else {
                        item.effortHours = total; 
                        item.point = NaNToZero(Math.ceil(parseFloat((total / (60 * 1.0)) * expectPoint)));
                        item.pointEST = Math.ceil(parseFloat((total / (60 * 1.0)) * expectPoint));
                        item.pointACT = Math.ceil(parseFloat((total / (60 * 1.0)) * expectPoint));
                      }
                      
                      
                    }
                  }
                  //Tinh theo level task
                  // if(taskLevel.value == undefined) {
                  //   setTaskLevel(taskLevelList[0]);
                  // }
                  if(item.bpAdddpoint > 0){
                    item.bpAdddpoint = NaNToZero(item.bpAdddpoint + (expectPoint * taskLevel.value));

                  }
                  if(item.point > 0){
                    item.point = NaNToZero(item.point + (expectPoint * taskLevel.value));

                  }

                  //set effort
                  item.isBurnPointEstimate = isBurnPointEstimate;
                  tmpResult.effortPoint = NaNToZero(item.effortPoint);
                  tmpResult.push(item);

                }

                //Update finished pharseeffortHours
                
              }
              // tmpResult.pntNo = lsReq.pntNo;
              let totalPoint = 0;
              for(let k = 0; k < tmpResult.length; k ++){
                totalPoint += NaNToZero(tmpResult[k].point);
                // if("PIM_PHS_CDFIN" == tmpResult[k].phsCd){
                //   tmpResult[k].point = 1000;
                // }
              }
            

              //Check total 
              requirementRP.lstReq = requirementRP.lstReq.filter(item => item.reqId == reqId);
              
              const gapPoint = NaNToZero(requirementRP.lstReq[0].pntNo) - totalPoint; //pntNo
              // console.log("totalPoint", totalPoint);
              // console.log("requirement.lstReq[0]", requirementRP.lstReq[0].pntNo);

              for(let k = 0; k < tmpResult.length; k ++){
                if("PIM_PHS_CDFIN" == tmpResult[k].phsCd){
                  tmpResult[k].point = NaNToZero(tmpResult[k].point + gapPoint);
                  // totalPoint += parseInt(FIN_POINT);
                }
              }
              requirementRP.totalPoint = totalPoint;
              setTaskInfo(requirementRP);
              setEffortInfo({
                totalPoint: totalPoint
              })
              // setOrgTaskInfo(requirementRP);
              let picFinish = [...tmpResult].filter(item => "PIM_PHS_CDFIN" == item.phsCd);
              if(picFinish) {
                const propMember = {
                  picFinish: picFinish,
                  lsMember: [...lsMember]
                }
                setMemberList(propMember);
              }
              setEffortWithMember(tmpResult);
              setMemberTaskList(result);
              console.log("setTaskInfo", effortInfo);

              // await clickupGetTask();
              // closeModal();
          
            }) //selectTaskList;

          }).catch((error) => {
            console.log("error-314", error);
            alert(`ERROR: ${error.msg}`);
            // closeModal();
          }) //get-actual-effort-point

      });
    }).then(async () => {
      // closeModal();
    }).catch((error) => {
      // closeModal();
    });
  }
  //  Internally, customStyles will deep merges your customStyles with the default styling.
  const customStyles = {
    rows: {
        style: {
            minHeight: '72px', // override the row height,
            border: '1px solid #dcdcdc'
        },
    },
    headCells: {
        style: {
            paddingLeft: '8px', // override the cell padding for head cells
            paddingRight: '8px',
        },
    },
    cells: {
        style: {
            paddingLeft: '8px', // override the cell padding for data cells
            paddingRight: '8px',
            border: '1px solid #dcdcdc'
        },
    },
  };

  const onRowDoubleClicked = (rowData) => {
    console.log("onRowDoubleClicked", rowData);
    const url = `https://blueprint.cyberlogitec.com.vn/UI_PIM_001_1/${rowData.reqId}`;
    let enabledMgmt = false;
    let enabled = false;
    window['chrome'].storage?.local.set({enabledMgmt});
    window['chrome'].storage?.local.set({enabled});

    window.open(url, "ADD POINT", "width="+screen.availWidth+",height="+screen.availHeight); //to open new page
  }

  const filterOnlySubmit = (status) => {
    console.log("filterOnlySubmit", status);
    setOnlySubmit(status);
    localStorage.setItem('ONLY_SUBMIT',  status);
  }

  const sortDesc  = (a: any, b: any) => {
    if(a.pntNo < b.pntNo) return 1;
    else if(a.pntNo > b.pntNo) return -1;
    else return 0;
  }

  const sortAsc  = (a: any, b: any) => {
    if(a.pntNo > b.pntNo) return 1;
    else if(a.pntNo < b.pntNo) return -1;
    else return 0;
  }

  return (
    <div className="grid grid-flow-row gap-1">
      <div className="grid grid-flow-col gap-1">
        <div>
          <label className="pt-3">
            <h3>
              Total: { props.data ?  props.data.length : 0 }
            </h3>
          </label> 
        </div>
        <div>
          <label className="pt-3 text-right gap-1 ">
            <input 
              type="checkbox"
              defaultChecked={onlySubmit}
              onChange={() => filterOnlySubmit(!onlySubmit) }
            />
            Only Submit
          </label>
        </div>
        
      </div>
      <DataTable
          columns = {columns}
          theme="default"
          fixedHeader
          fixedHeaderScrollHeight="390px"
          data = {
            props.data
          }
          onRowDoubleClicked = { event => onRowDoubleClicked (event)}
          
          conditionalRowStyles={conditionalRowStyles}
          customStyles={customStyles} 
          selectableRows
          selectableRowsHighlight
      />
    </div>
    
  )
}