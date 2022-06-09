var express = require('express');
var router = express.Router();
var db=require('mysql2-promise')();
var db_config=require('../db_config');
var lib=require('../js/lib');

var admin='admin';
var users='users';

db.configure(db_config['mysql']); // db conn, cursor 생성
sql=`SELECT emp_id FROM connect.hr_info WHERE (emp_grade_nm = '4급' AND duty_nm='팀장') 
OR (EMP_GRADE_NM in ('1급', '2급', '3급'))`;

var exception_list; // 3급 이상 또는 4급 팀장 사번 리스트

function get_exception_list(){
  db.query(sql).spread(function(rows){
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
    Admin page login URL
    메인 페이지의 '관리자 로그인' 버튼 클릭, 암호 입력해서 서버 정보와 일치한다면 특수한 관리자 세션 생성
    세션 정보에 관리자임을 식별할 수 있는 정보(isAdmin)을 True로 변경
    이후 admin page로 redirect
  */
  if (!req.session.data){ // session data 유효성 검사
    res.status(404).send('세션 정보가 없습니다. 그룹웨어 페이지에서 다시 접속해주세요.'); 
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
  if(req.session.isAdmin){
    req.session.isAdmin=false;
    req.session.save(()=>{
      res.send('로그아웃');
    })
  }else{
    res.status(404).send('관리자 권한이 없습니다. 그룹웨어 페이지에서 다시 접속해주세요.'); 
  }
})

router.get('/main', function(req, res) { //
  /*
    Admin page
    관리자 권한이 있는 세션 확인 후 세션에 담긴 사원 정보를 main.ejs로 넘겨주기
  */
  if(req.session.isAdmin){ // 관리자 권한 확인
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
      //세션 정보를 ejs로 보내 줌
      res.render('admin',{list:listJSON});
    }).catch((err)=>{
      console.log(err);
      res.status(404).send('직원 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.');
    })
  }else {
    res.status(404).send('관리자 권한이 없습니다. 그룹웨어 페이지에서 다시 접속해주세요.');
  }
});

router.get('/ehr/:type', async function(req, res){
  /*
    출퇴근/초과근무/급량비 기록 조회
    type : inout -> 출퇴근시각관리 form | cal_meal -> 급량비 form | edit -> 개인별근무일정변경 form
    이후 form 정보 리턴
  */
  if (!req.session.isAdmin){ // request, session, session data 유효성 검사
    res.status(404).send('관리자 권한이 없습니다. 그룹웨어 페이지에서 다시 접속해주세요.'); //추후 수정
  }

  // 필터 정보 가져오기
  var {emp_name, emp_id, org_nm, start_day, end_day}= req.query;

  //필터 정보 유무(undefined 포함)에 따른 sql 조건문 일부분
  var sql=` where a.ymd>=? and a.ymd<=?`;
  var sqlList=[start_day, end_day];
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

  
  switch(req.params.type){// inout, cal_meal
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
      }).catch(err=>{
        console.log(err);
        res.status(404).send('조회 시 오류가 발생하여 잠시 후에 다시 시도해주세요.');
      });
      break;
    case 'cal_meal': // 급량비
      
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
          }else{
            if(tempEmpId!=result[row]['EMP_ID']){ // 사번 정보 바뀔 때 감지
              tempEmpId=result[row]['EMP_ID'];
              temp_overtime='0000'
            }
            if(temp_week!=result[row['WEEK']]){ // 주차 바뀌면 임시변수 초기화
              temp_overtime_week='0000';
              temp_week=result[row]['WEEK'];
            }
          }

          //exception_list에 존재하는 대상일 때 
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

          if(temp_overtime_week>`1200`){// 주별 (12h) 초과근무 한계 넘어간경우
            console.log('주별 초과근무시간 초과 발생')
            result[row]['CUTOFF']=true;
            
            // 초과근무시간 잘라나기
            result[row]["CAL_OVERTIME"]=lib.subOverTime(
              result[row]["CAL_OVERTIME"],lib.subOverTime(
                temp_overtime_week,`${result[row]["over_std_time"]}00`
              )
            )
            
            //급량비 재산정    
            if(result[row]["CAL_MEAL"]=="TRUE"){
              if(lib.yyyymmddToDay(result[row]["YMD"])==0 || lib.yyyymmddToDay(result[row]["YMD"])==6){//주말
                if(result[row]["CAL_OVERTIME"]<'0200'){
                  result[row]["CAL_MEAL"]="FALSE";
                }
              }else{//평일
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
        res.status(404).send('조회 시 오류가 발생하여 잠시 후에 다시 시도해주세요.');
      });
      break;
    case 'edit': // 개인별근무일정변경
    default:
      res.status(404).send('오픈 예정');
  }
})

router.get('/download/:type', function(req, res){
  /*
    조회한 ehr 업로드 데이터를 client side에서 보유한 후 to_csv로 엑셀변환하여 리턴
    type : inout -> 출퇴근시각관리 form | cal_meal -> 급량비 form | edit -> 개인별근무일정변경 form
    이후 csv file download 유도
  */

  if (!req.session.isAdmin){ // request, session, session data 유효성 검사
    res.status(404).send('관리자 권한이 없습니다. 그룹웨어 페이지에서 다시 접속해주세요.'); 
  }
  console.log('download 시작');
  const xl = require('excel4node');
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Worksheet Name');
  
  var sql=``;

  var {emp_name, emp_id, org_nm, start_day, end_day}= req.query;

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
        res.status(404).send('Excel 생성 중 오류 발생');
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
      res.status(404).send('오픈 예정');
  }
})

router.get('/gw/ehr/con/:emp_id',function(req,res){ 
  /*
    그룹웨어 좌측 초과근무/연차잔여정보/교육시간정보 표출 위한 라우터
    connect.gw_ehr_con 정보 넘겨주기
    admin 세션(관리자 권한)과 관련 없어서 세션정보 확인 안함
  */
  const emp_id=req.params.emp_id;

  var sql=`select * from connect.gw_ehr_con where emp_id=${emp_id}`;
  db.query(sql).spread(function(rows){ 
    result=JSON.parse(JSON.stringify(rows));
    return result;
  }).then((result)=>{
    var new_result={}

    new_result["OVERTIME"]=`초과근무 <br/> ${lib.digitTimeToFormatted(result[0]["TOTAL_OVERTIME"])} / ${result[0]["over_std_time"]}시간`;
    new_result["VOC"]=`잔여연차 <br/> ${lib.floatTimeToFormatted(result[0]["dayoff_rest_time"])} / ${result[0]["dayoff_std_time"]}시간`;
    new_result["ORG_EDU"]=`기관교육 ${result[0]["i_edu_admit_time"]}시간 / ${result[0]["i_edu_std_time"]}시간`;
    new_result["IND_EDU"]=`개인교육 ${result[0]["p_edu_admit_time"]}시간 / ${result[0]["p_edu_std_time"]}시간`;
    return new_result;
  }).then((new_result)=>{
    console.log(new_result);
    res.jsonp(new_result); // Cross Domain 문제 (CORS) 회피를 위한 JSON response -> JSON_P response로 변경
  }).catch((err)=>{
    console.log(err);
  });
})

router.get('/error',function(req,res){ // admin에서 발생하는 모든 에러 케이스 처리
  var error_msg=req.query.msg;
  res.redirect('error',{error:error_msg});
});

module.exports=router; //이거 안해주면 main.js app(express) 객체에서 라우터 접근 못함