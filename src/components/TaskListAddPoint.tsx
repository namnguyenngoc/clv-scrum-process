import React, { useState } from "react";
import axios from "axios";
import myData from '../data.json';
import Moment from 'react-moment';
import 'moment-timezone';

export default function TaskListAddPoint() {
  // Moment.locale('en');
  let [picId, setPicId] = useState("");
  let [pointOnHour, setPointOnHour] = useState(25); //Point senior

  let [effortWithMember, setEffortWithMember] = useState([]);
  let [taskList, setTaskList] = useState([]);
  
  const url = 'https://blueprint.cyberlogitec.com.vn/api';
  const currentURL = window.location.href // returns the absolute URL of a page
  const pointDefaultByPharse = myData.pointDefaultByPharse;
  const lsMember = myData.memList;

  picId = 'namnnguyen';

  const handlepicIdChange = (event) => {
    setPicId(event.target.value);
  };

  const handlePointOnHourChange = (event) => {
    setPointOnHour(event.target.value);
  };
  const compareFn = (a: string, b: string) => {
    const startDate = a.createDate;
    const endDate = b.createDate;
    const start = new Date(`${startDate.slice(0,4)}-${startDate.slice(4,6)}-${startDate.slice(6,8)} ${startDate.slice(8,10)}:${startDate.slice(10,12)}`);
    const end = new Date(`${endDate.slice(0,4)}-${endDate.slice(4,6)}-${endDate.slice(6,8)} ${endDate.slice(8,10)}:${endDate.slice(10,12)}`);
    console.log("start", start);
    // const start = Moment (a.createDate); //2023 02 23 10 03
    // const end = Moment (b.createDate); //2023 02 23 10 03 , "YYYYMMDDHHmm"
    if(start > end) return -1;
    else if (start < end) return 1;
    else return 0;
  }
  const searchRequirement = async () => {

    const data = {
        "pjtId": "PJT20211119000000001",
        "advFlg": "N",
        "reqStsCd": [
            "REQ_STS_CDPRC",
            "REQ_STS_CDOPN"
        ],
        "picId": picId,
        "jbTpCd": "_ALL_",
        "itrtnId": "_ALL_",
        "beginIdx": 0,
        "endIdx": 200,
        "isLoadLast": false,
        "pageSize": 25
    };
    // let lsPharseMember = requirementDetail.lstSkdUsr
    let requirement = await axios.post(`${url}/uiPim001/searchRequirement`,   data
    ).then(res => {
      return res.data;
    });
    // console.log("requirementDetail", requirementDetail);
    console.log("requirement", requirement);
    //Sort
    if(requirement.lstReq){
      requirement.lstReq = [...requirement.lstReq.sort(compareFn)];
    }
    
    setTaskList(requirement.lstReq);

  }

  function sumEffort (lsData, userid, phsCd) {
    let sum = 0;
    for (let i = 0; i < lsData.length; i ++) {
      if(userid == lsData[i].usrId && phsCd == lsData[i].phsCd){
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

  const handleSubmit = (event) => {
    event.preventDefault();
    //https://blueprint.cyberlogitec.com.vn/api/getUserInfoDetails
    searchRequirement();
 
  };

  const linkToSite = (newReqId) => {
    localStorage.setItem("pageData", "Data Retrieved from axios request")
   // route to new page by changing window.location
    const url = `https://blueprint.cyberlogitec.com.vn/UI_PIM_001_1/${newReqId}`;
    window.open(url, "_blank"); //to open new page
  }
  

  return (
    <form className="grid grid-flow-row gap-2" 
          onSubmit={handleSubmit}>
      <div className="grid grid-flow-col gap-1">
        <table className="w-full border border-gray-500">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-right w-full">
                  PIC
                </th>
                <th className="px-4 py-2 text-right">
                  <input
                    type="text"
                    id="picId"
                    value={picId}
                    onChange={event => setPicId(event.target.value) }
                    className="col-span-2 border border-gray-500 px-4 py-2 rounded-lg"
                  />
                </th>
                <th className="px-4 py-2 text-right w-100">
                  <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg w-100">
                    Search
                  </button>
                </th>
                
              </tr>
            </thead>
          </table>
      </div>
      <div>
        
      </div>
      <div className="table-container">
        <table className="w-full border border-gray-500 custom-scroll">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2 w-170">Assignee</th>
              <th className="px-4 py-2 text-right w-100">Effort Point</th>
            </tr>
          </thead>
          <tbody className="border-t">
            {taskList.map((item) => (
              <tr key={item.reqId} className="border-t">
                <td className="px-4 py-2 text-blue">
                  <a onClick={event => linkToSite(item.reqId)}>
                    {item.reqTitNm}
                  </a>
                </td>
                <td className="px-4 py-2 w-170">{item.assignee}</td>
                <td className="px-4 py-2 text-right w-100">{item.pntNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
