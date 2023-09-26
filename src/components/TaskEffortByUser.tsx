import React, { useState,CSSProperties } from "react";
import axios from "axios";
import myData from '../data.json';
import moment from 'moment';
import Select, { components } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import ACC_SHEET_API from '../credentials.json';

const InputMemberOption = ({
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
      {children}
    </components.Option>
  );
};

export default function TaskEffortByUser(props) {
  const SHEET_ID = "Member_List";
  const RANGE_MEMBER_SHEET = 'A1:AT';
  const SPREADSHEET_ID = "10WPahmoB6Im1PyCdUZ_uda3fYijC8jKtHnRBasnTK3Y";
  let [docTitle, setDocTitle] = useState();
  // let [lstUserInTeam, setLstUserInTeam] = useState([]);


  const url = 'https://blueprint.cyberlogitec.com.vn/api';
  const DT_FM = 'YYYYMMDD';
  const defaultMem = null;
  let allMember = [];
  myData.memList.map(
    function (item) {
      // console.log("item", item);
      if(item.teamLocal.includes("NEWFWD")) {
        item.label = item.userId, //`${item.fullName}-${item.pointOnHour.expect}(${item.currentLevel})`;
        item.value = item.userId
        allMember.push(item);
        // return item;
      }
  });

  const [memberSelect, setMemberSelect] = useState(null);
  const today = moment(new Date());
  console.log("today", today);
  const firstDayOfMonth = today.clone().startOf("month");
  // const newFirstDay = new Date(today.year(), today.month(), firstDayOfMonth);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth._d);
  const [endDate, setEndDate] = useState(new Date());
  const [effortList, setEffortList] = useState([]);
  const [workday, setWorkday] = useState(0);
  const [monthDay, setMonthDay] = useState(0);

  // https://blueprint.cyberlogitec.com.vn/api/uiPim026/searchUserInTeam
  async function searchUserInTeam() {
    let ro = {
      "stDt": moment(startDate).format("YYYYMMDD"),
      "endDt": moment(endDate).format("YYYYMMDD"),
      "procFlg": "DF",
      "beginIdx": 0,
      "endIdx": 25,
      "pageChanged": false,
      "coCd": "DOU",
      "lstTeamId": "ATM201705250009,ATM201705150001",
      "stsChanged": "N",
      "tskSts": "PR",
      "rsName": ""
  };
  

    // console.log("RO", ro);

    // console.log("reqee", req)
    const response = await axios.post(`${url}/uiPim026/searchUserInTeam`, ro)
      .then(async function (response) {
        return response.data.lstUserInTeam ;
    });

  
    // console.log("response", response);
    return new Promise((resolve, reject) => {
        resolve(response);
    });
  }

  async function getDailyTasksByUser(item:any) {
    let ro = {
      "usrId": item.userId,
      "fromDt": moment(startDate).format("YYYYMMDD"),
      "toDt": moment(endDate).format("YYYYMMDD")
    };
  
    // console.log("RO", ro);

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

  const count_holiday = (start, end) => {
    let count = 0;
    while (start <= end) {
      console.log("start", start.format(DT_FM));
      if(myData.workingDay.holidays.find(({ holidayDate }) => holidayDate == start.format(DT_FM))){
        count++;
      }
      start = start.add(1, "days");
     
    }
    return count;
  };
  const selectMemberList = async () => {
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
  
    const sheet = doc.sheetsByTitle[SHEET_ID]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    
    const range = RANGE_MEMBER_SHEET; //'A1:AB50'
    await sheet.loadCells(range); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
    
    for(let i = 0; i < 18; i ++) {
      const empCode = sheet.getCell(i, 0); // access cells using a zero-based index
      const userId = sheet.getCell(i, 1); // access cells using a zero-based index
      const fullName = sheet.getCell(i, 2); // access cells using a zero-based index
      const leaveTeam = sheet.getCell(i, 26); // access cells using a zero-based index = sheet.getCell(i, 2); // access cells using a zero-based index
      // console.log("leaveTeam.formattedValue", leaveTeam.formattedValue);
      if(empCode.formattedValue != "" 
        && userId.formattedValue != "" 
        && fullName.formattedValue != ""
        && leaveTeam.formattedValue == "N") {
            let mem = {
                "empCode":        sheet.getCell(i, 0).formattedValue,
                "userId":         sheet.getCell(i, 1).formattedValue,
                "fullName":       sheet.getCell(i, 2).formattedValue,
                "currentLevel":   sheet.getCell(i, 3).formattedValue,
                "lvlCode":        sheet.getCell(i, 4).formattedValue,
                "levelRating":    sheet.getCell(i, 5).formattedValue,
                "targetLevel":    sheet.getCell(i, 6).formattedValue,
                "tagartRating":   sheet.getCell(i, 7).formattedValue,
                "pointOnHour": {
                  "standard":   sheet.getCell(i, 38).formattedValue,
                  "timeStandard":   sheet.getCell(i, 39).formattedValue,
                  "expect":     sheet.getCell(i, 9).formattedValue,
                  "description": sheet.getCell(i, 10).formattedValue,
                  "averageEffortPoint":sheet.getCell(i, 39).formattedValue,
                  "minEffortPoint":sheet.getCell(i, 40).formattedValue,
                  "maxEffortPoint":sheet.getCell(i, 41).formattedValue,
                  "effortPointByCurrentLevel":sheet.getCell(i, 42).formattedValue,
                  "effortPointByTargetLevel":sheet.getCell(i, 43).formattedValue,

                },
                "role":           sheet.getCell(i, 11).formattedValue.split(","),
                "workload":       sheet.getCell(i, 12).formattedValue,
                "pointStandard":  sheet.getCell(i, 13).formattedValue, //FINISHE / RECEIVED
                "teamLocal":      sheet.getCell(i, 14).formattedValue.split(","),
                "dedicated":      sheet.getCell(i, 15).formattedValue,
                "blueprint_id":   sheet.getCell(i, 16).formattedValue,
                "blueprint_nm":   sheet.getCell(i, 17).formattedValue,
                "clickup_id":     sheet.getCell(i, 18).formattedValue,
                "clickup_nm":     sheet.getCell(i, 19).formattedValue,
                "effectDateFrom": sheet.getCell(i, 20).formattedValue,
                "effectDateTo":   sheet.getCell(i, 21).formattedValue,
                "preReviewDate":  sheet.getCell(i, 22).formattedValue,
                "nextReviewDate": sheet.getCell(i, 23).formattedValue,
                "phone":          sheet.getCell(i, 24).formattedValue,
                "clvEmail":       sheet.getCell(i, 25).formattedValue,
                "leaveTeam":      sheet.getCell(i, 26).formattedValue,
                "leaveCompany":   sheet.getCell(i, 27).formattedValue,
                "maxLevelTaskGap":sheet.getCell(i, 32).formattedValue,
                "minPoint"        :sheet.getCell(i, 33).formattedValue,
                "maxPoint"        :sheet.getCell(i, 34).formattedValue,
                "target"        :sheet.getCell(i, 36).formattedValue,
            }
            arrMember.push(mem);
      }
      
    }
    // console.log("arrMember", arrMember);
    return new Promise((resolve, reject) => {
      resolve(arrMember);
    });
      
      
    //Sheet End
   
  }
  const selectTaskByUser = async (memSelect: any) => {
    const strFrm = moment(startDate);
    const endFrm = moment(endDate);
    const workday = workday_count(strFrm, endFrm);
    const lvlList = myData.levelList;
    setWorkday(workday);

    const diffMonth = moment(endFrm._i).diff(moment(strFrm._i), 'months', true);
    setMonthDay(Math.round(diffMonth));

    if(startDate && endDate) {

      // const newList = await getDailyTasksByUser(memberSelect[0]);
      let sheetMember = await selectMemberList();
      const lstUserInTeam = await searchUserInTeam();
    
      const newList = sheetMember.map(async function (item) {
        //Get task
      
        const res = await getDailyTasksByUser(item);
        if(res){

          item.effortPoint = sumEfrtKnt (res.dailyRsrcLst);
          item.timeWorked = 0;
          let pointStd = lvlList.filter(itm => itm.code.toUpperCase() == item.lvlCode.toUpperCase());
          if(pointStd && pointStd.length > 0){
            item.pointStd = pointStd[0];

          } else {
            item.pointStd = {
              "min": 0,
              "max": 0,
              "gap": 0,
              "taskLevelMax": 0,
              "agvDay": 0,
              "agvMonth": 0
            }
          }
          // console.log("lstUserInTeam", lstUserInTeam);
          let itemTask = lstUserInTeam.filter(itm2 => itm2.usrId == item.userId);
          item.countTask = 0;
          if(itemTask && itemTask.length > 0){
            let _task = itemTask[0];
            item.countTask = _task.pd_knt +  _task.op_knt +  _task.proc_knt;
          }
        }
        return item;
      })
      console.log("memberSelect", memSelect);
      let newListSrt = await Promise.all(newList);
      if(memSelect != null) {
        newListSrt = newListSrt.filter(mem => mem.userId == memSelect.userId);
      }
      setEffortList(newListSrt);
    }
  }
  
  const onChangeDate = async (date: any, type: any) => {
    if('START' == type) {
      setStartDate(date);

    } else {
      setEndDate(date)
      
    }
   

    await selectTaskByUser(memberSelect);
  }
  const formatPrice = (value, tofix) => {
    if (!value) {
      return ''
    }
    const val = (value / 1).toFixed(tofix).replace(',', '.')
    if (!val) {
      return ''
    }

    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  };
  
  const onChangeMember = async (option: any) => {
    console.log("option", option);
    setMemberSelect(option);
    selectTaskByUser();

  }
 
  return (
    <div className="grid grid-flow-row gap-2">
      <div className="grid grid-flow-col gap-1 px-2">
        <div className="w-150">
          <Select
            defaultValue={defaultMem}
            closeMenuOnSelect={true}
            hideSelectedOptions={false}
            isClearable={true}
            onChange={(mem) => {
              setMemberSelect(mem);
              selectTaskByUser(mem);
            }
            } 
            options={allMember}
            components={{
              Option: InputMemberOption
            }}
          />
        </div>
        <div>
          <DatePicker selected={startDate} onChange={(date) => onChangeDate(date, "START")} className="w-150"/>

        </div>
        <div>
          <DatePicker selected={endDate} onChange={(date) => onChangeDate(date, "END")} className="w-150"/>

        </div>
        <div>
          <div> { workday } days </div>
          <div>
            {formatPrice(monthDay,0)} months
          </div>
        </div>
        <div className="w-70">
          <button 
            type="button" 
            className="bg-blue-500 text-white py-2 px-4 rounded-lg ml-4" 
            onClick={event => selectTaskByUser(memberSelect)}>
            Search
          </button>
        </div>
        
      </div>
      <div className="table-container-10" style={{
        height: "310px",
      }}>
        <table className="w-full border border-gray-500 custom-scroll">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 w-100">Name</th>
              <th className="px-4 py-2 w-150">Target Level</th>
              <th className="px-4 py-2 w-50">Task</th>
              <th className="px-4 py-2 text-right w-70">Current Eff.</th>
              <th className="px-4 py-2 w-70 text-right">Standard Eff.</th>
              <th className="px-4 py-2 text-right w-70">Gap STD</th>
              <th className="px-4 py-2 w-70 text-right">Target Eff.</th>
              <th className="px-4 py-2 text-right w-70">Gap Target</th>
              <th className="px-4 py-2 w-70 text-right">Eff.(BP)</th>
              <th className="px-4 py-2 text-right w-70">Min</th>
              <th className="px-4 py-2 text-right w-70">Mean</th>
              <th className="px-4 py-2 text-right w-70">Max</th>
              <th className="px-4 py-2 text-right w-150">Start Review</th>
              <th className="px-4 py-2 text-right w-150">End Review</th>
            </tr>
          </thead>
          <tbody className="border-t">  
            {effortList.map((item) => (
              <tr key={item.value} className={(item.pointOnHour.expect * workday * 8 ) > item.effortPoint || item.countTask <= 0  ? "border-t bg-misty" : "border-t"}>
                <td className="px-4 py-2 w-100">{item.fullName}</td> {/* Name */}
                <td className="px-4 py-2 w-150">{item.targetLevel}-{item.tagartRating}</td> {/* Target Level */}
                <td className="px-4 py-2 w-50 text-right">{item.countTask}</td>
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.effortPoint / (monthDay == 0 ? 1: monthDay), 0)}</td> {/* Avg Point */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.pointOnHour.effortPointByCurrentLevel, 0)}</td> {/* Point Standard */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.pointOnHour.effortPointByCurrentLevel - (item.effortPoint / (monthDay == 0 ? 1: monthDay)), 0)}</td> {/*GAP */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.pointOnHour.effortPointByTargetLevel, 0)}</td> {/* Point Target */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.pointOnHour.effortPointByTargetLevel - (item.effortPoint / (monthDay == 0 ? 1: monthDay)), 0)}</td> {/*GAP */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.effortPoint,0)}</td> {/*  Total Point */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.pointOnHour.minEffortPoint, 0)}</td> {/*  Min */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.pointOnHour.averageEffortPoint, 0)}</td> {/*  Mean */}
                <td className="px-4 py-2 text-right w-70">{formatPrice(item.pointOnHour.maxEffortPoint, 0)}</td> {/*  Max */}
                <td className="px-4 py-2 text-right w-150">{item.effectDateFrom}</td> {/*  Next Preview */}
                <td className="px-4 py-2 text-right w-150">{item.effectDateTo}</td> {/*  Next Preview */}

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}