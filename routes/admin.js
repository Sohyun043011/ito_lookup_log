var express = require('express');
var router = express.Router();
var db=require('mysql2-promise')();
var db_config=require('../db_config');
var lib=require('../js/lib');

var admin='admin';
var users='users';
db.configure(db_config['mysql']);
sql=`SELECT emp_id FROM connect.hr_info WHERE (emp_grade_nm = '4급' AND duty_nm='팀장') 
OR (EMP_GRADE_NM in ('1급', '2급', '3급'))`;

var exception_list;

function get_exception_list(){
  db.query(sql).spread(function(rows){ //세션 수 조회
    result=JSON.parse(JSON.stringify(rows));
    for(i in result){
      result[i]=result[i]["emp_id"]
    }
    return result;
  }).then((result)=>{
    exception_list=result;
  }).catch((error)=>{
    console.log(error);
  })
}

get_exception_list();

router.post('/login',function(req, res){ //data 키값 중 password라는 항목 받아오기
  /*
    관리자 페이지 로그인
    메인 페이지의 '관리자 로그인' 버튼 클릭, 암호 입력해서 서버 정보와 일치한다면 특수한 관리자 세션 생성
    별도의 세션 테이블을 유지하거나 세션 정보에 관리자임을 식별할 수 있는 정보를 넣기
    이후 '/admin'으로 redirect
  */
  if (!req.session.data){ // session data 유효성 검사
    res.status(404).send('세션 정보 없음'); //추후 수정
  }

  password=db_config.adminPageInfo.password; // 관리자 로그인 암호
  user_pw=req.body.password; // 패스워드 입력값

  //user_pw와 password가 일치한다면 세션 data에 isAdmin:true로 추가해주고 /admin/main페이지로 redirect
  if(user_pw==password){
    req.session.isAdmin=true;
    req.session.save(()=>{
      res.send('패스워드 일치');
    });
  }else{
    res.status(404).send('비밀번호가 틀렸습니다.');
  }
});

router.get('/logout',function(req,res){ // 별도로 session destroy를 해주지 않아도 됨
  req.session.isAdmin=false;
  req.session.save(()=>{
    res.send('로그아웃');
  })
})

router.get('/main', function(req, res) { //
  /*
    관리자 페이지
    1. 관리자 권한이 있는 세션 확인 후 세션 정보와 조직 정보를 main.ejs로 넘겨주기
  */
  if(req.session.isAdmin){
    db.query(`select DEPT_NAME from connect.gw_dept_info 
    where DEPT_NAME not in ('인천관광공사','사장','본부장','테스트팀','전자결재임시조직')`).spread(function(rows){
      return lib.jsonize(rows);
    }).then(function(result){
      var listJSON={
        session_data:req.session.data[0],
        dept_info:result
      }
      return listJSON;
    }).then(function(listJSON){
      res.render('admin',{list:listJSON});
    })

    // 세션 정보를 ejs에 보내줌
  }else res.status(404).send('관리자 권한이 없습니다. 로그인 후 다시 시도해주세요.'); //추후 수정
});

router.get('/ehr/:type', async function(req, res){
  /*
    ehr 업로드 폼 조회
    type : inout -> 출퇴근시각관리 form | cal_meal -> 급량비 form | edit -> 개인별근무일정변경 form
    이후 form 정보 리턴
  */
  if (!req.session.isAdmin){ // request, session, session data 유효성 검사
    res.status(404).send('관리자 권한이 없습니다. 로그인 후 다시 시도해주세요.'); //추후 수정
  }
  var {emp_name, emp_id, org_nm, start_day, end_day}= req.query;

  var sql=` where a.ymd>=? and a.ymd<=?`;

  var sqlList=[start_day, end_day];
  // 들어온 req.query에 따른 sql where 조건 수정하주기
  if (!(emp_name==undefined||emp_name=='')){
    sqlList.push(emp_name);
    sql=sql+` and a.NAME=?`; 
  }
  if (!(emp_id==undefined||emp_id=='')){
    sqlList.push(emp_id);
    sql=sql+` and a.EMP_ID=?`; 
  }
  
  if (!(org_nm==undefined||org_nm==''||org_nm=='부서를 선택해주세요')){ // select default option일 경우도 예외 처리
    sqlList.push(org_nm);
    sql=sql+` and a.ORG_NM=?`; 
  }
  switch(req.params.type){
    case 'inout': // 출퇴근 시각관리
      sql='select a.EMP_ID as EMP_ID, a.NAME as NAME, a.YMD as YMD, a.WORK_TYPE as WORK_TYPE, a.FIX1 as FIX1, a.`INOUT` as `INOUT`, a.PLAN1 as PLAN1, a.ERROR_INFO as ERROR_INFO from connect.ehr_cal a '+sql+` order by EMP_ID, YMD`;
      db.query(sql,sqlList).spread(function(rows){
        result=JSON.parse(JSON.stringify(rows));
        for(line of result){
          line["INOUT"]=line["INOUT"].split('~').map(str=>{
            if(str==''){
                return '';
            }
            return str.substring(0,2)+':'+str.substring(2)
          }).join('~')
          if(line["FIX1"]!='ERROR'){
            line["FIX1"]=line["FIX1"].split('~').map(str=>{
              if(str==''){
                  return '';
              }
              return str.substring(0,2)+':'+str.substring(2)
            }).join('~')
          }else{
            line["FIX1"]='수기 계산 필요';
          }
          if(line["PLAN1"]!='None'){
            line["PLAN1"]=line["PLAN1"].split('~').map(str=>{
              if(str==''){
                  return '';
              }
              return str.substring(0,2)+':'+str.substring(2)
            }).join('~')
          }else{
            line["PLAN1"]='~';
          }
          if(line["ERROR_INFO"]=='None'){
            line["ERROR_INFO"]='';
          }
        }
        return result;
      }).then((result)=>{
        res.json(result);
      });
      break;
    case 'cal_meal': // 급량비
      // sql='select EMP_ID, NAME, YMD, CAL_OVERTIME, CAL_MEAL, ORG_NM from connect.ehr_cal'+sql+` and cal_meal!='0000' order by EMP_ID, YMD`;
      var tempEmpId; // 임시저장사번 
      var temp_overtime='0000'; // 임시저장초과근무시간
      var temp_overtime_week='0000' // 임시 초과근무 저장변수 (주별)
      var temp_week; // 임시 주차 저장변수

      sql='SELECT a.EMP_ID AS EMP_ID, a.`NAME` AS `NAME`, a.YMD AS YMD, a.CAL_OVERTIME AS CAL_OVERTIME, a.CAL_MEAL AS CAL_MEAL, a.ORG_NM as ORG_NM,' +
      ' a.`INOUT` AS `INOUT`,'+
      ` b.over_std_time AS over_std_time from connect.ehr_cal a LEFT JOIN (SELECT EMP_ID, over_std_time FROM connect.gw_ehr_con)b`+
      ` ON a.EMP_ID=b.EMP_ID `+ sql+` and (a.CAL_OVERTIME!='0000' OR a.CAL_MEAL!='FALSE') order by EMP_ID, YMD`;

      db.query(sql,sqlList).spread(function(rows){ //세션 수 조회
        
        result=JSON.parse(JSON.stringify(rows));
        new_result={
          "empInfo":[], // 일별 데이터
          "endOfWeek": lib.weekOfMonth(end_day) // 마지막 주 정보
        }
        var row=0;
        while(row<result.length){
          result[row]['WEEK']=lib.weekOfMonth(result[row]['YMD']);
          result[row]['CUTOFF']=false;
          result[row]['EXCEPT']=false;
          if(row==0){// 사번 맨처음 넣기
            tempEmpId=result[row]['EMP_ID'];
            temp_week=result[row]['WEEK'];
          }else if(tempEmpId!=result[row]['EMP_ID']){
            tempEmpId=result[row]['EMP_ID'];
            temp_overtime='0000'
          }else{
            if(temp_week!=result[row['WEEK']]){
              temp_overtime_week='0000';
              temp_week=result[row]['WEEK'];
            }
          }
          if(exception_list.indexOf(result[row]['EMP_ID'])!=-1){
            console.log('exception list!')
            result[row]['over_std_time']=0;
            result[row]['EXCEPT']=true;
            row++;
            continue;
          }
          if(temp_overtime==(parseInt(result[row]["over_std_time"])*100).toString()){//초과근무 꽉 채우면 모두 drop
            result.splice(row, 1);
            continue;
          }
          temp_overtime=lib.addOverTime2(temp_overtime, result[row]["CAL_OVERTIME"]);
          temp_overtime_week=lib.addOverTime2(temp_overtime_week, result[row]["CAL_OVERTIME"]);
          if(temp_overtime_week>`1200`){// (주별 12h) 초과근무 한계 넘어간경우
            console.log('주별 초과근무시간 초과 발생')
            result[row]['CUTOFF']=true;
            result[row]["CAL_OVERTIME"]=lib.subOverTime(result[row]["CAL_OVERTIME"],lib.subOverTime(temp_overtime_week,`${result[row]["over_std_time"]}00`))
            
            // 급량비 TRUE이면
            // 주말데이터면 2시간 넘겨야 급량비 TRUE
            // 평일이면 1시간 넘겨야 급량비 TRUE
    
            if(result[row]["CAL_MEAL"]=="TRUE"){
              if(lib.yyyymmddToDay(result[row]["YMD"])==0 || lib.yyyymmddToDay(result[row]["YMD"])==6){
                if(result[row]["CAL_OVERTIME"]<'0200'){
                  result[row]["CAL_MEAL"]="FALSE";
                }
              }else{
                if(result[row]["CAL_OVERTIME"]<'0100'){
                  result[row]["CAL_MEAL"]="FALSE";
                }
              }
            }
          }
          if(temp_overtime>`${result[row]["over_std_time"]}00`){//초과근무 한계 넘어간경우
            result[row]['CUTOFF']=true;
            result[row]["CAL_OVERTIME"]=lib.subOverTime(result[row]["CAL_OVERTIME"],lib.subOverTime(temp_overtime,`${result[row]["over_std_time"]}00`))
            temp_overtime=`${result[row]["over_std_time"]}00`;

            if(result[row]["CAL_MEAL"]=="TRUE"){
              if(lib.yyyymmddToDay(result[row]["YMD"])==0 || lib.yyyymmddToDay(result[row]["YMD"])==6){
                if(result[row]["CAL_OVERTIME"]<'0200'){
                  result[row]["CAL_MEAL"]="FALSE";
                }
              }else{
                if(result[row]["CAL_OVERTIME"]<'0100'){
                  result[row]["CAL_MEAL"]="FALSE";
                }
              }
            }
          }
          row++;
        }
        new_result["empInfo"]=result
        new_result=JSON.parse(JSON.stringify(new_result));
        return new_result;
      }).then((result)=>{
        res.json(result);
      }).catch((err)=>{
        console.log(err);
      });
      break;
    case 'edit': // 개인별근무일정변경
    default:
      res.status(404).send('<p>오류</p>'); //추후 수정
  }
})

router.get('/download/:type', function(req, res){
  /*
    조회한 ehr 업로드 데이터를 client side에서 보유한 후 to_csv로 엑셀변환하여 리턴
    type : inout -> 출퇴근시각관리 form | cal_meal -> 급량비 form | edit -> 개인별근무일정변경 form
    이후 csv file download 유도
  */

  if (!req.session.isAdmin){ // request, session, session data 유효성 검사
    res.status(404).send('관리자 권한이 없습니다. 로그인 후 다시 시도해주세요.'); //추후 수정
  }
  console.log('download 시작');
  const xl = require('excel4node');
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Worksheet Name');
  
  var sql=``;

  var {emp_name, emp_id, org_nm, start_day, end_day}= req.query;
  console.log(req.query);

  var sql=` where ymd>=? and ymd<=?`;

  var sqlList=[start_day, end_day];
  
  if (!(emp_name==undefined||emp_name=='')){
    sqlList.push(emp_name);
    sql=sql+' and `NAME`=?'; 
  }
  if (!(emp_id==undefined||emp_id=='')){
    sqlList.push(emp_id);
    sql=sql+` and EMP_ID=?`; 
  }
  
  if (!(org_nm==undefined||org_nm==''||org_nm=='부서를 선택해주세요')){
    sqlList.push(org_nm);
    sql=sql+` and ORG_NM=?`; 
  }

  switch(req.params.type){
    case 'inout': // 출퇴근 시각관리
      sql='select EMP_ID, NAME, YMD, ORG_NM, SHIFT_CD, WORK_TYPE, FIX1, `INOUT`, PLAN1 from connect.ehr_cal'+sql+
      ` order by EMP_ID, YMD`;
      db.query(sql,sqlList).spread(function(rows){ 
        result=JSON.parse(JSON.stringify(rows));
        //lib 특정 함수에 result 인수로 보내서 출퇴근시각관리 양식으로 전처리
        return lib.makeInoutUploadForm(result);
      }).then((result)=>{
        result.write(`출퇴근시각관리 (${start_day.substring(2)}-${end_day.substring(2)}).xlsx`,res);
      })
      .catch(error => {
        console.log(error)
        res.status(404).send('Excel 생성 중 예기치 못한 문제 발생'); //추후 수정
      })
      break;
    case 'cal_meal': // 급량비
      sql='select EMP_ID, NAME, YMD, ORG_NM, WORK_TYPE, CAL_OVERTIME, RSN from connect.ehr_cal'+sql+
      ` and CAL_OVERTIME !='0000' and CAL_MEAL='TRUE' order by EMP_ID, YMD`;
      db.query(sql,sqlList).spread(function(rows){ 
        result=JSON.parse(JSON.stringify(rows));
        //lib 특정 함수에 result 인수로 보내서 출퇴근시각관리 양식으로 전처리
        return lib.makeOverTimeUploadForm(result);
      }).then((result)=>{
        result.write(`시간외전표연동 (${start_day.substring(2)}-${end_day.substring(2)}).xlsx`,res);
      })
      .catch(error => {
        console.log(error)
        res.status(404).send('Excel 생성 중 예기치 못한 문제 발생'); //추후 수정
      })
      break;
    case 'edit': // 개인별근무일정변경
      break;
    default:
      res.status(404).send('잘못된 url 접근'); //추후 수정
  }
})

router.get('/gw/ehr/con/:emp_id',function(req,res){
  const emp_id=req.params.emp_id;
  console.log(emp_id);

  var sql=`select * from connect.gw_ehr_con where emp_id=${emp_id}`;
  db.query(sql).spread(function(rows){ 
    result=JSON.parse(JSON.stringify(rows));
    //lib 특정 함수에 result 인수로 보내서 출퇴근시각관리 양식으로 전처리
    
    return result;
  }).then((result)=>{
    var new_result={}
    console.log(result[0]);
    new_result["OVERTIME"]=`초과근무 <br/> ${lib.digitTimeToFormatted(result[0]["TOTAL_OVERTIME"])} / ${result[0]["over_std_time"]}시간`;
    new_result["VOC"]=`잔여연차 <br/> ${lib.floatTimeToFormatted(result[0]["dayoff_rest_time"])} / ${result[0]["dayoff_std_time"]}시간`;
    new_result["ORG_EDU"]=`기관교육 ${result[0]["i_edu_admit_time"]}시간 / ${result[0]["i_edu_std_time"]}시간`;
    new_result["IND_EDU"]=`개인교육 ${result[0]["p_edu_admit_time"]}시간 / ${result[0]["p_edu_std_time"]}시간`;
    return new_result;
  }).then((new_result)=>{
    console.log(new_result);
    res.jsonp(new_result);
  }).catch((err)=>{
    console.log(err);
  });
})

module.exports=router;