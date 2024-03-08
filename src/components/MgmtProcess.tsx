import React, { useState, CSSProperties, useEffect } from "react";
import axios from "axios";
import myData from '../data.json';
import PointSuggest from './PointSuggest';
import Select, { components } from "react-select";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import ACC_SHEET_API from '../credentials.json';
import ScaleLoader from "react-spinners/ScaleLoader";
import Modal from 'react-modal';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { WEB_INFO } from '../const';
import Button from '../components/Button';


const InputTrongSoOption = ({
  getStyles,
  Icon,
  isDisabled,
  isFocused,
  isSelected,
  children,
  innerProps,
  ...rest
}) => {
const [isActive, setIsActive] = useState(false);
const onMouseDown = () => setIsActive(true);
const onMouseUp = () => setIsActive(false);
const onMouseLeave = () => setIsActive(false);

// styles
let bg = "transparent";
if (isFocused) bg = "#eee";
if (isActive) bg = "#B2D4FF";

const style = {
  alignItems: "center",
  backgroundColor: bg,
  color: "inherit",
  display: "flex "
};

// prop assignment
const props = {
  ...innerProps,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  style
};

  return (
    <components.Option
      {...rest}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isSelected={isSelected}
      getStyles={getStyles}
      innerProps={props}
    >
      <input type="checkbox" checked={isSelected} className="mr-4" />
      {children}
    </components.Option>
  );
};
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "#36d7b7",
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  background: "rgb(255, 255, 255, 0.4)",
  textAlign: "center",
  paddingTop: "21%",
};
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zindex: '-1',
  },
};

export default function MgmtProcess() {
  let [reqId, setReqId] = useState("");
  let [pointOnHour, setPointOnHour] = useState(25); //Point senior
  let [sprintNumber, setSprintNumber] = useState("Sprint 32");
  let [clickID, setClickID] = useState("");
  let [effortWithMember, setEffortWithMember] = useState([]);
  let [taskInfo, setTaskInfo] = useState({});
  let [orgTaskInfo, setOrgTaskInfo] = useState({});
  let [effortInfo, setEffortInfo] = useState({});

  let [taskInfoSheet, setTaskInfoSheet] = useState({});
  let [reqDetail, setReqDetail] = useState({});
  let [memberTaskList, setMemberTaskList] = useState({});
  
  let [suggetList, setSuggetList] = useState([]);
  let [comment, setComment] = useState("");
  let [config, setConfig] = useState({
    isLoadGoogleSheet: true,
    WORKING_API: WEB_INFO.WORKING_API,
    TASK_MEMBER_API: WEB_INFO.TASK_MEMBER_API
  });

  let [isShowDetailEffortTable, setIsShowDetailEffortTable] = useState(true);
  let [isCheckEffort, setIsCheckEffort] = useState(false);
  let [isCurrentMonth, setIsCurrentMonth] = useState(true);
  let [clickupTask, setClickupTask] = useState({});

  
  const prjId = "PJT20211119000000001";

  const url = 'https://blueprint.cyberlogitec.com.vn/api';
  const currentURL = window.location.href // returns the absolute URL of a page
  // const pointDefaultByPharse = myData.pointDefaultByPharse;
  // const lsMember = myData.memList;

  const taskLevelList = myData.taskLevel;
  const defaultTrongSo = taskLevelList[0];
  const [taskLevel, setTaskLevel] = useState(taskLevelList[0]);
  const SHEET_ID = "Member_List";
  const RANGE_MEMBER_SHEET = 'A1:AQ50';
  const SPREADSHEET_ID = "10WPahmoB6Im1PyCdUZ_uda3fYijC8jKtHnRBasnTK3Y";


  //Team B Manager Sheet
  const MGMT_TASK_SHEET_ID = "NEW_FWD_TEAMB_TASKS";
  const MGMT_TASK_RANGE_MEMBER_SHEET = 'A1:AO';
  const MGMT_TASK_SPREADSHEET_ID = "1jsBbrJZ8AYuNTRiBMLfcngHi0f6vCF1XocbvvpJDBAM";
  let [docTitle, setDocTitle] = useState();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  let subtitle;
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#0E71CC");
  
  const [logWorkDate, setLogWorkDate] = useState(new Date());
  let [clickTaskInfo, setClickTaskInfo] = useState(null);
  let [isOpenConfirm, setIsOpenConfirm] = useState(false);
  let [clickupIDUrl, setClickupIDUrl] = useState(true);
  let [iIsJira, setIsJira] = useState(false);

  const today = moment(new Date());
  const firstDayOfMonth = today.clone().startOf("month");
  const [startDate, setStartDate] = useState(firstDayOfMonth._d);
  const [endDate, setEndDate] = useState(new Date());
  const [memberList, setMemberList] =  useState({});
  const [capaInfo, setCapaInfo] = useState({
    background: '#F08080'
  });
  const [copyTitle, setCopyTitle] =  useState("Copy");

  const [copyStatus, setCopyStatus] =  useState("Copy");
  const [copyDescription, setCopyDescription] =  useState("Copy");

  
  const [copyToken, setCopyToken] =  useState("Copy");
  let [devName, setDevName] = useState("");
  let [taskFullDescription, setTaskFullDescription] = useState("");

  const [subjectTask, setSubjectTask] = useState("[New US FWD][Dev Name][Team B][Sprint #][ClickupID] Click Name");
  const [clickupRefreshToken, setClickupRefreshToken] = useState("");
  const [domain, setDomain] = useState(window.location.hostname);
  const onChangeLevel = (option: any) => {
    setTaskLevel(option);
  }

  const arr = currentURL.split("/");
  if(arr && arr.length > 0){
    // const reqId = arr[arr.length-1];
    reqId = arr[arr.length-1];
  }
  const handleReqIdChange = (event) => {
    setReqId(event.target.value);
  };

  const handlePointOnHourChange = (event) => {
    setPointOnHour(event.target.value);
  };
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
  
  const sumEfrtKnt = (arr) => {
    let sum = 0;
    for(let i = 0; i < arr.length; i ++){
      sum += arr[i].efrtKnt;
    }
    return sum;
  }
  const count_holiday = (start, end) => {
    let count = 0;
    const DT_FM = 'YYYYMMDD';
    while (start <= end) {
      console.log("start", start.format(DT_FM));
      if(myData.workingDay.holidays.find(({ holidayDate }) => holidayDate == start.format(DT_FM))){
        count++;
      }
      start = start.add(1, "days");
     
    }
    return count;
  };
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

  //Jira
  const jiraGetTicket = async () => {
    if(iIsJira) {
      const config = {
        // ...REQ_HEADER.headersBear
        withCredentials: true,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': WEB_INFO.JIRA_PIM.AUTHEN,
        },
      }
      let _url = `${WEB_INFO.JIRA_PIM.API}/jira/rest/api/latest/issue/CALG-1802?_=1709867453037`;
      const tasks = await axios.get(_url, config).then(async (res) => {
        console.log("jiraGetTicket", res);
       
        // return res.data;
      });
    }

    const requirementDetail = await  axios.get(`${url}/searchRequirementDetails?reqId=${reqId}`)
    .then(async(res) => {
        console.log("JIRA", res)
    });

  };

  //End jira
  const searchRequirement = async () => {
    openModal();
    jiraGetTicket();
       // https://blueprint.cyberlogitec.com.vn/api/uiPim001/searchRequirement
    //https://blueprint.cyberlogitec.com.vn/api/task-details/get-actual-effort-point?reqId=${lsReq[i].reqId}
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
              await clickupGetTask();
              closeModal();
          
            }) //selectTaskList;

          }).catch((error) => {
            console.log("error-314", error);
            alert(`ERROR: ${error.msg}`);
            closeModal();
          }) //get-actual-effort-point

      });
    }).then(async () => {
      closeModal();
    }).catch((error) => {
      closeModal();
    });
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

  function formatTime (time) {
    let hour = parseInt((time > 59 ? time : 0) / 60);
    let min = time > 0 ? time % 60 : 0;
    return `${hour}h ${min}m`;
  }

  const formatNumber = (value: any, tofix: any, isInt: boolean) => {
    if (!value)
      return ''

    const val = (value / 1).toFixed(tofix).replace(',', '.')
    if (!val)
      return ''

    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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

  const handleSubmit = async (event) => {
    openModal();
    event.preventDefault();
    let isCheckEst = true;
    if(isOpenConfirm) {
      if (confirm("Bạn có muốn check estimate task không?") == true) {
        //https://blueprint.cyberlogitec.com.vn/api/getUserInfoDetails
        await searchRequirement();
      } else {
        isCheckEst = false;
      }
    } else {
      await searchRequirement();
    }
    await closeModal();

  };

  const buildComment = (cmtVO: any, detailReqVO) => {
    let comment = "";
    let prntNm = "";
    switch (cmtVO.type) {
      //change point process
      case "pntProc":
          const pointChange = Math.floor(((parseFloat(cmtVO.newPoint) - parseFloat(cmtVO.oldPoint)) * 100) / 100);
          const dispPnt = (pointChange > 0) ? "+" + pointChange : pointChange;
          comment += '<div style="margin-left: 10px"> <i>&nbsp; Phase ' + cmtVO.phsNm + ': </i>' + cmtVO.newPoint + ' <b> (' + dispPnt + ') </b> ' +
              '</div> ';
          break;
      //update start date current phase
      //update start date current phase
      case "actual":
        comment = '<div class="system-comment">' + (cmtVO.addSts ? "Added" : "Removed") + ' time worked:</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Phase Name: </i></b>' + cmtVO.phsNm + '</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Job Category: </i></b>' + cmtVO.jbNm + '</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Time Worked : </i></b>' + cmtVO.wrkTm + '</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Date: </i></b>' + cmtVO.dt + '</div>';
        break;
    case "updActEffPnt":
        comment = '<div class="system-comment">' + (cmtVO.addSts ? "Updated" : "Removed") + ' time worked:</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Phase Name: </i></b>' + cmtVO.phsNm + '</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Job Category: </i></b>' + cmtVO.jbNm + '</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Time Worked : </i></b>' + cmtVO.wrkTm + '</div>' +
            '<div style="margin-left: 10px"> <b><i> &nbsp; Date: </i></b>' + cmtVO.dt + '</div>';
        break;
     
    }
    return comment;
  } 

  const logWorkFinish = async (usrId) => {
    //https://blueprint.cyberlogitec.com.vn/api/task-details/add-actual-effort-point
    // Req
    // {"usrId":"namnnguyen","wrkDt":"20230621","reqId":"PRQ20230607000000031","pjtId":"PJT20211119000000001","subPjtId":"PJT20211119000000001","cmt":"Done task.","jbId":"JOB20211125000000001","phsCd":"PIM_PHS_CDFIN","phsNm":"Finish","jbNm":"Skill","wrkTm":" 20 Minute","dt":"Jun 21, 2023","addSts":true,"type":"actual","actEfrtMnt":20,"cmtCtnt":"<div class=\"system-comment\">Added time worked:</div><div style=\"margin-left: 10px\"> <b><i> &nbsp; Phase Name: </i></b>Finish</div><div style=\"margin-left: 10px\"> <b><i> &nbsp; Job Category: </i></b>Skill</div><div style=\"margin-left: 10px\"> <b><i> &nbsp; Time Worked : </i></b> 20 Minute</div><div style=\"margin-left: 10px\"> <b><i> &nbsp; Date: </i></b>Jun 21, 2023</div>","pstTpCd":"PST_TP_CDACT"}
    let w_date_log = moment(logWorkDate).format("ll");
    let memberResponse = await axios.get(`${config.TASK_MEMBER_API}/memberList`)
      .then(async function (response) {
        let data =  response.data.data;
        
        return data;

      });

    let timeLog = 20;
    let cmt = "Done Task.";
    let currentUser = memberResponse.filter(item => item.userId == usrId);
    if(currentUser && currentUser.length > 0) {
      currentUser = currentUser[0];
      timeLog = parseInt(currentUser.pharsetimestandard_min);
      cmt = currentUser.description;
    }
    let ro = {
        "usrId": usrId,
        "wrkDt": moment(logWorkDate).format("YYYYMMDD"),  
        "reqId": reqDetail.detailReqVO.reqId,
        "pjtId": reqDetail.detailReqVO.pjtId,
        "subPjtId": reqDetail.detailReqVO.subPjtId,
        "cmt": cmt,
        "jbId": "JOB20211125000000001",
        "phsCd": "PIM_PHS_CDFIN",
        "phsNm": "Finish",
        "jbNm":  "Skill",
        "wrkTm": ` ${timeLog} Minute`,
        "dt": w_date_log,
        "addSts": true,
        "type": "actual",
        "actEfrtMnt": timeLog,
        "cmtCtnt": "",
        "pstTpCd": "PST_TP_CDACT"
    }

    let cnt = buildComment(ro);
    if(cnt) {
      ro.cmtCtnt = cnt;
      console.log("commnt", cnt);
      let response = axios.post(`${url}/task-details/add-actual-effort-point`, ro).then(async function (response) {
        const msg =   response.data.saveFlg;//saveFlg: 'SAVE_SUCCEED', pstId: 'PST20230303000001056'}

          alert(msg);
          if('SAVE_SUCCEED' == msg) {
            window.location.reload(false);

          }
      });

    }
    // Response
    // {"msg":"Saved successfully!","saveFlg":"SAVE_SUCCEED","msgTp":"Success","resultVO":{"className":"com.dou.pim.models.ActualEffortPointVO","actEfrtSeqNo":"1274341","usrId":"namnnguyen","phsCd":"PIM_PHS_CDFIN","jbId":"JOB20211125000000001","cmt":"Done task.","wrkDt":"20230621","actEfrtMnt":"20","phsNm":"Finish","usrNm":"Nam Ngoc Nguyen","jbNm":"Skill","mode":0},"pstId":"PST20230622000001586"}
  }

  const cfmEditPoint = async ( ) => {
    let lstSkdObj = reqDetail.lstSkdUsr; //searchTaskDetail - line 140 - UI_PIM_001_1 PRQ20230228000000295

    // let lstPhs =  lstSkdObj; //$$("lstPhs").serialize();
    let lstPhsPoint = [];
    let cmtCtnt = '<div class="system-comment"> • Updated Point: </div>';
    let totalPnt = 0;
    console.log("effortWithMember", effortWithMember);
    console.log("lstSkdObj", lstSkdObj);
    for(let i = 0; i < lstSkdObj.length; i ++){
      let item = lstSkdObj[i];
          //For update automatic
      item.oldPoint = (item.efrtNo) ? item.efrtNo : 0;
      // if("PIM_PHS_CDFIN" === item.phsCd ){
      //   item.newPoint = item.bpAdddpoint;
      // } else {
      //   item.newPoint = item.point;
      // }
      item.newPoint = item.point;
      lstPhsPoint.push({
        skdId: item.skdId,
        efrtNo: (item.newPoint) ? item.newPoint : "0"
      });
      if (parseFloat(item.newPoint) != parseFloat(item.oldPoint)) {
        const cmtVO = {
            ...item,
            type: 'pntProc'
        };
        cmtCtnt += buildComment(cmtVO);
      }
    }

    if(cmtCtnt && !cmtCtnt.toUpperCase().includes("UNDEFINED") && !cmtCtnt.toUpperCase().includes("NAN")) {
      let ro = {
          reqId: reqDetail.detailReqVO.reqId,
          lstPhsPoint: lstPhsPoint,
          cmtCtnt: cmtCtnt,
          pjtId: reqDetail.detailReqVO.pjtId,
          subPjtId: reqDetail.detailReqVO.subPjtId,
          customFlg: true,
          action: 'REQ_WTC_EFRT',
          pstTpCd: 'PST_TP_CDACT',
      };
      // ro.pstTpCd = POST_TYPE_CODE_ACTIVITY;

      console.log("RO", ro);

      let response = axios.put(`${url}/update-point-process-phase`, ro).then(async function (response) {
        const msg =   response.data.saveFlg;//saveFlg: 'SAVE_SUCCEED', pstId: 'PST20230303000001056'}

          alert(msg);
          if('SAVE_SUCCEED' == msg) {
            console.log(" window.opener", " window.opener");
            // window.opener.searchRequirementCallBack();
            window.location.reload(false);

          }
      });
    
      
      let cmtVo = {
        type: "pntProc",
        lstPoint: effortWithMember,
    
      }
      console.log("comment", cmtCtnt);
      setComment(cmtCtnt);
    } else {
      alert(cmtCtnt)
    }
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
      setDocTitle(doc.title);

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
  const selectTaskList = async (team, req) => {
    var timerStart = Date.now();
    console.log("TASK - Time until DOMready: ", Date.now()-timerStart);
    if(!team) {
      team = "Team B";
    }
    let taskList = [];
   
    //Sheet Start
    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = await new GoogleSpreadsheet(MGMT_TASK_SPREADSHEET_ID); //script data
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
    console.log("Task_BP_INFO", taskInfo);
    setDocTitle(doc.title);

    const sheet = doc.sheetsByTitle[MGMT_TASK_SHEET_ID]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    console.log(sheet.title);
    console.log(sheet.rowCount);
    const range = MGMT_TASK_RANGE_MEMBER_SHEET; //'A1:AB50'
    await sheet.loadCells(range); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
    

    //Get Task clickup
    let clickupId = "";
    let startdate = "";
    let enddate = "";
    let estHourDev = 0;
    let estHourTest = 0;
    
    // return new Promise((resolve, reject) => {
    //   resolve(res.data);
    // });
    // return res.data;
 
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
      if(reqName) {
        if(ketQua && ketQua.length > 4) {
          clickupId = ketQua[4].replace("[", "").replace("]", "");
          let sprint = 0;
          // for(let i = 0; i < newArr.length; i ++) {
          //   if(newArr[i].contains)
          // }
          let findSprint = newArr.filter(e => e.includes("Sprint"));
          console.log("Sprint", findSprint);
          if(findSprint && findSprint.length > 0) {
            let arr = findSprint[0].split(" ");
            sprint = arr[1];
          }
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
  
                let mem = {
                  "sprint": sprint,
                  "effortdev": 0,
                  "efforttest": 0,
                  "startdate": "",
                  "enddate": "",
                  "clickupId": clickupId
                  
                  
              }
                if(sheetClickupId.formattedValue == clickupId
                  && sprint == sheetSprint.formattedValue) {
                      mem = {
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
    //Sheet End
   
  }

  let sumPoint = (task, isAbs) => {
    let total = 0;
    console.log("sumPoint", task);
    let finEffort = 0;
    for(let item of task){
      total += item.point;
      // if(task.isBurnPointEstimate){
      //   total += Math.abs(item.pointEST);
      // } else {
      //   total += Math.abs(item.pointACT);
      // }
    }
    return total;
  }

  let sumPointActual = (task) => {
    let total = 0;
    for(let item of task){
      if("PIM_PHS_CDFIN" != item.prntPhsCd) {
        if(item.isBurnPointEstimate){
          total += item.pointEST;
        } else {
          total += item.pointACT;
        }
      }
    }
    console.log("total", total);
    return total;
  }

  const changeEstimateOrActual = (item, isEstimate) => {
  
    // setTaskInfo(orgTaskInfo);
// 
    item.isBurnPointEstimate = isEstimate;
    if(isEstimate) {
      item.point = NaNToZero(item.pointEST);
    } else {
      item.point = NaNToZero(item.pointACT);
    }
    // setEffortWithMember(effortWithMember);

    let newEffort = [...effortWithMember];
    
   
    // const effort = (taskInfo && taskInfo.lstReq && taskInfo.lstReq.length > 0) ? taskInfo.lstReq[0].pntNo : 0;
    // const act = sumPoint(newEffort, true);

    // //Neu estimate ma lon hơn act thi lay act tinh toan
    // if(effort > act) {
    //   console.log("taskInfo-taskInfo", taskInfo);

    //   // taskInfo.totalPoint = effort;
    //   const temp = {
    //     totalPoint: effort
    //   }
    //   setEffortInfo(temp);

    // } else {
    //   const temp = {
    //     totalPoint: sumPointActual(newEffort)
    //   }
    //   setEffortInfo(temp);
    //   // taskInfo.totalPoint = sumPointActual(newEffort, true);
    // }
    let temp = {
      ...effortInfo
    }

    temp.totalPoint= sumPointActual(newEffort);
    setEffortInfo(temp);
    console.log("setEffortInfo", effortInfo);

    let newTaskInfo = {
      ...taskInfo
    }
    // newTaskInfo.totalPoint = sumPoint(newEffort, true);
    setTaskInfo(newTaskInfo);
   

    // console.log("taskInfo-gapAddFinish", gapAddFinish);
    let pointFin = NaNToZero(taskInfo.lstReq[0].pntNo);
    
    for(let pharse of newEffort) {
      if("PIM_PHS_CDFIN" == pharse.prntPhsCd) {
          
      } else {
        console.log(`POINT: ${pointFin}-${ taskInfo.lstReq[0].pntNo}-${ pharse.pointEST}-${pharse.pointACT}`);
        if(pharse.isBurnPointEstimate){
          pointFin = pointFin -  pharse.pointEST;

        } else {
          pointFin = pointFin -  pharse.pointACT;
        }

        pointFin = NaNToZero(pointFin);
      }
    }
      
    console.log("taskInfo-newEffort", newEffort);

    console.log("taskInfo-pointFin", pointFin);
    console.log(`POINT-fn: ${pointFin}`);
    //Cap nhat point fin 
    for(let pharse of newEffort) {
      if("PIM_PHS_CDFIN" == pharse.prntPhsCd) {
          pharse.point  =  NaNToZero(pointFin);
          pharse.pointACT  = pointFin;
          pharse.pointEST  = pointFin;
        }
      
    }
    setEffortWithMember(newEffort);
 
  }

  const openClickUp = (item) => {
    if(item && item.id) {
      const url = `https://app.clickup.com/t/${item.id}`;
      window.open(url, "_blank"); //to open new page

    }
    console.log("item-", item);
  }
  const checkEstimateTask = async () => {
    // setIsOpen(true);
    let memberTaskInfo = {};
   
    selectTaskList("A").then(async (item)=>{
      if(item && item.length > 0){
       
        memberTaskInfo = item[0];
      }
    });
    return new Promise((resolve, reject) => {
      resolve(memberTaskInfo);
    });
  }
  // modal
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = '#f00';
  }

  async function closeModal() {
    console.log("closeModal");
    setIsOpen(false);
  }

  const onChangeDate = async (date: any) => {
    setLogWorkDate(date);
  }
  
  const handleKeyDownClickup = (event) => {
    if(clickupIDUrl) {
      updateClickupID();
    }
    clickupGetTaskV2();
  }
  const clickupGetTaskV2 = async () => {
    setLoading(true);
    if(clickID) {
      const config = {
        // ...REQ_HEADER.headersBear
        withCredentials: true,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': WEB_INFO.CLICKUP.AUTHEN,
        },
      }
      let _url = `${WEB_INFO.CLICKUP.API}/task/${clickID}`;
      const tasks = await axios.get(_url, config).then(async (res) => {
        console.log("res2", res);
        let data = res.data;
        const __task = await createSubjectTask(data);
       
        data.subjectTask = __task.sub;
        setSubjectTask(__task.sub);
        setTaskFullDescription(__task.content);
        setClickTaskInfo(data);
        setLoading(false);
        // return res.data;
      });
    }
  }
  const clickupGetTask = async () => {
    if(clickID){
      
      let response = await axios.get(`${config.WORKING_API}/clickup/getTask/${clickID}`)
      .then(async function (response) {
        let data =  response.data.data;
        if(data && data.parent) {
          await axios.get(`${config.WORKING_API}/clickup/getTask/${data.parent}`)
          .then(async function (res2) {
            console.log("parentDetail", res2.data.data);
            data.parentDetail = res2.data.data;
          });
        }
        
        const __task = await createSubjectTask(data);
        data.subjectTask = __task.sub;
        setSubjectTask(__task.sub);
        setTaskFullDescription(__task.content);
        setClickTaskInfo(data);
      });
    }
  }

  const createSubjectTask = async (task) => {
    // format
    // "[New US FWD][Dev Name][Team B][Sprint #][ClickupID] Click Name"
    let prjName = "New US FWD";
    let devName = localStorage.getItem('DEVELOP_CARIS_NAME');
    let teamName = "Team B";
   
    let idClickUp = clickID;
    let nameClickup = task.name; 

    let _localtions = task.locations;
    if(_localtions && _localtions.length > 0) {
      let _sNumber = _localtions[_localtions.length-1].name;
      let arr = _sNumber.split(" ");

      setSprintNumber(`Sprint ${arr[1]}`);
    }

    if(!devName) {
      devName = 'Dev Name';
    }
    
    let sprint = sprintNumber ;
    let refresh_token =  localStorage.getItem('refresh_token');
    // [New US FWD][Phuc Nguyen][Team B][Sprint 3][86cuevjr7]
    let sub = `[${prjName}][${devName}][${teamName}][${sprintNumber}][${idClickUp}] ${nameClickup}`;

    let url = "tasks/v2/task";
    let body = {
      "show_closed_subtasks": false,
      "customFieldValues": [],
      "subtask_archived": false,
      "rollup": [],
      "task_ids": [
        task.id,
      ],
      "fields": [
          "rolledUpPointsEstimate",
          "assignees",
          "assigned_comments_count",
          "dependency_state",
          "parent_task",
          "subtasks_by_status",
          "attachments_count",
          "tags",
          "simple_statuses",
          "rolledUpTimeEstimate",
          "rolledUpTimeSpent",
          "totalTimeSpent",
          "statuses",
          "pageLinks"
      ],
      "include_default_permissions": false
    };
  
    let __task = await callAPIClickup(`${WEB_INFO.CLICKUP.API}/task/${task.id}`,body);
    console.log("task", __task);

    const fullDescription = `----- Sprint ${sprintNumber} -----\n${__task.description}\n\n***Clickup: ${__task.url}\n\n***Parent: ${__task.parent ? __task.parent : ""}\n\nTest information:
    `;
    let obj = {
      sub: sub,
      content: fullDescription,
    }
    return obj;
  }

  const concatDesciption = (url, body) => {
    if(!clickTaskInfo) return "";
    if(!clickTaskInfo.parentDetail) return clickTaskInfo.description;

    let sumDesc = `${clickTaskInfo.description}\n----------------\n${clickTaskInfo.parentDetail.description}`;
    return sumDesc;
  }

  const callAPIClickup = async (url, body) => {
    if(!clickupRefreshToken) return;
    const config = {
      // ...REQ_HEADER.headersBear
      withCredentials: true,
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': WEB_INFO.CLICKUP.AUTHEN,
      },
    }
    // const config = {
    //     // ...REQ_HEADER.headersBear
    //     withCredentials: true,
    //     headers: {
    //       'Content-Type': 'application/json', 
    //       'Accept': 'application/json',
    //       'Origin': '*',
    //       'Access-Control-Allow-Headers': '*',
    //       'Access-Control-Allow-Origin': '*',
    //       Authorization: `Bearer ${clickupRefreshToken}` 
      
    //     }
    // };
    //console.log("Config", config);
    const _body = {
        ...body,
    }

    const tasks = await axios.get(url, config).then(async (res) => { return res.data;
    });

    // const tasks = await axios.post(url, _body, config
    // ).then(async (res) => {
    //   return res.data;
    // });

    return new Promise((resolve, reject) => {
      resolve(tasks);
  });
  }
  const checkCAPA = async () => {

  }

  const updateClickupID = () => {
    const arr =  window.location.href.split("/");
    if(arr && arr.length > 0){
      let reqId = arr[arr.length-1];
      setClickID(reqId);
    }
  }

  const SaveDevelopName = () => {
    localStorage.setItem('DEVELOP_CARIS_NAME', devName);
  }
  useEffect(()=>{
    //get clickup tocket

    // setClickupRefreshToken
    setDomain(window.location.hostname);
    console.log("domain", domain);
    let refresh_token = "";
    if(domain) {
      if ("BLUEPRINT.CYBERLOGITEC.COM.VN" == domain.toUpperCase()) {
        refresh_token =  localStorage.getItem('Clickup_Refresh_Token');
       
        
      } else if ("APP.CLICKUP.COM" == domain.toUpperCase()) {
        refresh_token = localStorage.getItem('id_token');
      }
    }

    setClickupRefreshToken(refresh_token);

    localStorage.setItem('Clickup_Refresh_Token', refresh_token);
    setDevName((localStorage && localStorage.getItem('DEVELOP_CARIS_NAME')) ?  localStorage.getItem('DEVELOP_CARIS_NAME') : "Dev Name");
    updateClickupID();
  },[])

  return (
    <div className="grid grid-flow-row gap-3 sweet-loading">
      <form>
        <div className="grid grid-flow-row px-2">
        <label
          style={{
              fontSize: 26
            }
          }
        >
          Task detail
        </label>
        </div>
        <div className="grid grid-flow-row">
          <div className="grid grid-flow-col gap-1">
            <div className="grid grid-flow-row gap-1">
              <div className="grid grid-flow-col gap-1">
                <label>
                  Clickup ID
                </label>
                <label>
                    <div onClick={evnet=>openClickUp(clickTaskInfo)}>
                      { clickTaskInfo ? clickTaskInfo.status.status : "" }
                    </div>
                </label>
              </div>
              <input
                type="text"
                id="clickID"
                value={clickID}
                defaultValue={clickID}
                style={{
                  backgroundColor: clickTaskInfo ? clickTaskInfo.status.color : "#FFFFFF"
                }}
                onChange={event => setClickID(event.target.value)}
                className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg"
              />
            </div>

            <div className="grid grid-flow-row gap-1 w-100">
              <div className="grid grid-flow-col gap-1">
                <label>
                  Sprint
                </label>
                <label>
                    <div onClick={evnet=>openClickUp(clickTaskInfo)}>
                      { clickTaskInfo ? clickTaskInfo.status.status : "" }
                    </div>
                </label>
              </div>
              <input
                type="text"
                id="sprintNumber"
                value={sprintNumber}
                defaultValue={sprintNumber}
                onChange={event => setSprintNumber(event.target.value)}
                className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg"
              />
            </div>
            <div className="grid grid-flow-row gap-1 w-70" >
              <div>
                <label>
                  ID by URL
                </label>
              </div>
              <input 
                  type="checkbox"
                  defaultChecked={clickupIDUrl}
                  onChange={() => setClickupIDUrl(!clickupIDUrl) }
                  className="border border-gray-500 px-4 py-2 rounded-lg"
                />
            </div>

            <div className="grid grid-flow-row gap-1 w-70" >
              <div>
                <label>
                  JIRA
                </label>
              </div>
              <input 
                  type="checkbox"
                  defaultChecked={isJira}
                  onChange={() => setIsJira(!isJira) }
                  className="border px-4 py-2 rounded-lg"
                />
            </div>

            <div className="grid grid-flow-row gap-1">
              <div>
                <label></label>
              </div>
              <button 
                disabled={!localStorage.getItem('Clickup_Refresh_Token') ? true : false}
                type="button" 
                className="bg-blue-500 text-white py-2 px-4 rounded-lg ml-4"
                onClick={handleKeyDownClickup}>
                Get
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-flow-row">
          <div className="grid grid-flow-col gap-1">
            <label>
              Clickup Name
            </label>
          
          </div>
          
          <input
            type="text"
            id="clickupName"
            value={clickTaskInfo ? clickTaskInfo.name : ""}
            onClick={handleKeyDownClickup}
            className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg"
          />
        </div>
        <div className="grid grid-flow-row">
          <div className="grid grid-flow-col gap-1">
              <label>
                Dev Name
              </label>
              <button 
                disabled={!localStorage.getItem('Clickup_Refresh_Token') ? true : false}
                type="button" 
                className="bg-blue-500 text-white py-2 px-4 rounded-lg ml-4"
                onClick={SaveDevelopName}>
                  Save Dev Name
              </button>
            </div>
          <input
            type="text"
            id="devName"
            value={devName}
            defaultValue={devName}
            onChange={event => setDevName(event.target.value)}
            className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg w-full"
          />
        </div>
        <div className="grid grid-flow-row">
          <div className="grid grid-flow-col gap-1">
              <label>
                Blueprint Title Task
              </label>
              <div>
                <Button 
                  disabled={!clickTaskInfo || clickTaskInfo.name == "" ? true : false }
                  onClick={() => {navigator.clipboard.writeText(subjectTask); setCopyTitle("Copied")}}
                  >
                  <div className="grid grid-flow-col gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 18 20"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-6 h-6 mr-2"
                    >
                      <path
                        d={
                          'M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z'
                        }
                      />
                      <path
                        d={
                          'M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z'
                        }
                      />
                    </svg>
                    <span>{copyTitle}</span>
                  </div>
                
                </Button>
              </div>
              
            </div>
          <input
            type="text"
            id="subjectTask"
            value={subjectTask}
            className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg w-full"
          />
        </div>
        <div className="grid grid-flow-row">
          <div className="grid grid-flow-col gap-1 pb-1">
            <div className="grid grid-flow-col gap-1">
              <label>
                Clickup Description
              </label>
              <div>
                <Button 
                  disabled={!clickTaskInfo || clickTaskInfo.description == "" ? true : false }
                  onClick={() => {navigator.clipboard.writeText(taskFullDescription); setCopyDescription("Copied")}}
                  >
                  <div className="grid grid-flow-col gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 18 20"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-6 h-6 mr-2"
                    >
                      <path
                        d={
                          'M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z'
                        }
                      />
                      <path
                        d={
                          'M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z'
                        }
                      />
                    </svg>
                    <span>{copyDescription}</span>
                  </div>
                
                </Button>
              </div>
              
            </div>
          </div>
        
          <textarea
            id="description"
            rows="8"
            value={taskFullDescription}
            onClick={handleKeyDownClickup}
            className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg"
          />
        </div>
        <div className="grid grid-flow-row">
          <div className="grid grid-flow-col gap-1">
            <label>
              Parent Description
            </label>
            
          </div>
          
          <textarea
            id="description"
            rows="6"
            value={clickTaskInfo && clickTaskInfo.parentDetail ? clickTaskInfo.parentDetail.description : ""}
            onClick={handleKeyDownClickup}
            className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg"
          />
        </div>

        <div className="grid grid-flow-col gap-1 pb-1">
            <div className="grid grid-flow-col gap-1">
                <input
                  type="text"
                  id="clickupRefreshToken"
                  value={clickupRefreshToken}
                  defaultValue={clickupRefreshToken}
                  style={{
                    backgroundColor: clickTaskInfo ? clickTaskInfo.status.color : "#FFFFFF"
                  }}
                  onChange={event => {setClickupRefreshToken(event.target.value) }}
                  className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg w-full"
                />
                <div>
                  <button 
                    type="button" 
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg ml-4"
                    onClick={() => {navigator.clipboard.writeText(clickupRefreshToken); setCopyToken("Copied")}}>
                      {copyToken}
                  </button>
                  {/* <button 
                    type="button" 
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg ml-4"
                    onClick={() => {setClickupRefreshToken(navigator.clipboard.readText())}}>
                      Paste
                  </button> */}
                  
                  <button 
                    disabled={clickupRefreshToken || "APP.CLICKUP.COM" == domain.toUpperCase() ? false : true}
                    type="button" 
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg ml-4"
                    onClick={() => { localStorage.setItem('Clickup_Refresh_Token', clickupRefreshToken);}}>
                      Save New Token
                  </button>
                </div>
              
            </div>
          </div>
          <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
        >
            <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
            <button onClick={closeModal}>close</button>
            <div>I am a modal</div>
            <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
            </form>
        </Modal>
        <ScaleLoader
            color={color}
            loading={loading}
            cssOverride={override}
            aria-label="Loading Spinner"
            data-testid="loader"
        />
        </form>
    </div>
  );
}
