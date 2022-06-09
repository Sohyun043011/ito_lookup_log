var express = require('express');
var router = express.Router();
var db=require('mysql2-promise')();
var db_config=require('../db_config');
var lib=require('../js/lib');

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

router.get('/login/:emp_id', async function(req, res){
  /*
    User page login URL
    최초 세션 테이블에서 세션 갯수 확인 및 직원 정보가 일치하면 세션 생성해주고
    main page로 redirect
    IE browser는 구버전의 스크립트 엔진 이슈로 지원하지 않음
  */
  if((req.header('User-Agent').indexOf('Chrome') || req.header('User-Agent').indexOf('Firefox'))==-1){
    /*
      Chronium 기반 브라우저(Chrome, Edge, Firefox) 제외한 모든 브라우저의 접근 차단
    */
    console.log('IE 감지')
    res.redirect('/users/error');
  }else{
    sql='select count(*) as session_count from good.session_lookup_log' 
    db.query(sql).spread(function(rows){ //세션 수 조회
      if(JSON.parse(JSON.stringify(rows))[0]['session_count']>=50){
        // 접속 중인 세션이 50개 이상이면 접속 차단 후 404 error (with msg) 보냄 
        res.status(404).send('접속 중인 사용자가 너무 많습니다. 잠시 후에 시도해주세요.');
      }
    })
    /* 
      넘겨받은 emp_id로 직원 정보 조회
      cf) req.params는 get request url에 binding된 parameter (/login/:emp_id 에서 emp_id)
          req.query는 get request url 끝에 붙는 query string (/query/search?searchWord=DB에서 searchWord)
          req.body는 post request의 body에 담긴 데이터
    */

    sql=`select EMP_ID, EMP_NM, ORG_NM from connect.hr_info where emp_id=${req.params.emp_id}`;
    db.query(sql).spread(function(rows){ // 넘겨받은 emp_id로 직원 정보 조회
      if (JSON.parse(JSON.stringify(rows)).length==1){
        console.log(`${req.params.emp_id}님의 직원정보가 존재합니다.`);
        req.session.data=JSON.parse(JSON.stringify(rows));
        // isAdmin property : 관리자 페이지에 접근할 권한 여부
        req.session.isAdmin=false;
        req.session.save(()=>{
          console.log(`${req.params.emp_id} 세션 생성`);
          /* 
            /user/main/으로 redirect
            ajax로 처리하는 router에서는 redirect가 적용되지 않음
          */
          res.redirect('/users/main')
        });
      } else{
        res.status(404).send('직원정보가 존재하지 않음');
      };
    }).catch((err)=>{
      console.log(err);
      res.status(404).send('로그인 오류가 발생하여 잠시 후 다시 시도해주세요.');
    })
  }
});

router.get('/main', function(req, res) { //
  /*
    Main Page
    세션 정보를 페이지단으로 넘겨주기(ejs)
  */
  if(req.session.data){ // 세션 유효성 검증
    res.render('main',{list:req.session.data[0]})
  }else res.status(404).send('세션 정보가 없습니다. 그룹웨어 페이지에서 다시 접속해주세요.');
});

router.post('/inout',function(req, res){
  /*
    출퇴근 기록 조회 버튼 클릭 시 발생
    
    필터 정보(사번, 부서, 기간)를 기준으로 중계DB의 connect.ehr_cal에서 데이터를 가져오기
    이후 JSON data return
  */
  if(!req.session.data){ // 세션정보 존재하지 않으면 오류 표출
    res.status(404).send('세션 정보 없음');
  }

  const {emp_id, start_day, end_day}=req.body; // 필터 정보 저장

  sql='select EMP_ID, NAME, ORG_NM, YMD, WORK_TYPE, FIX1, `INOUT`, PLAN1, ERROR_INFO from connect.ehr_cal ' +
  'where emp_id=? and ymd>=? and ymd<=? order by YMD'; // 직원 출퇴근 기록을 날짜 순으로 정렬, '?'로 사번, 기간 binding
  db.query(sql,[emp_id, start_day, end_day]).spread(function(rows){ // list query binding
    result=JSON.parse(JSON.stringify(rows));
    for(line of result){
      line["INOUT"]=line["INOUT"].split('~').map(str=>{
        if(str==''){
            return '';
        }
        return str.substring(0,2)+':'+str.substring(2)
      }).join('~') // 출퇴근기록 처리 'hhmm~hhmm' => 'hh:mm~hh:mm'

      if(line["FIX1"]!='ERROR'){
        line["FIX1"]=line["FIX1"].split('~').map(str=>{
          if(str==''){
              return '';
          }
          return str.substring(0,2)+':'+str.substring(2)
        }).join('~') // 확정시간 처리 'hhmm~hhmm' => 'hh:mm~hh:mm'
      }else{
        line["FIX1"]='수기 계산 필요';
      }

      if(line["PLAN1"]!='None'){
        line["PLAN1"]=line["PLAN1"].split('~').map(str=>{
          if(str==''){
              return '';
          }
          return str.substring(0,2)+':'+str.substring(2)
        }).join('~') // 계획시간 처리 'hhmm~hhmm' => 'hh:mm~hh:mm'
      }else{
        line["PLAN1"]='~';
      }

      if(line["ERROR_INFO"]=='None'){
        line["ERROR_INFO"]='';
      }
    }
    return result;
  }).then(result=>{
    res.json(result);
  }).catch(err=>{
    console.log(err);
    res.status(404).send('조회 시 오류가 발생하여 잠시 후에 다시 시도해주세요.');
  });
});

router.post('/overtime',async function(req, res){
  /*
    초과근무 및 급량비 조회 버튼 클릭 시 발생
    필터 정보(사번, 연/월)를 기준으로 중계DB의 connect.ehr_cal에서 데이터 가져오기

    최초에 해당 연월에 해당하는 ehr_cal 데이터 행 수와 날짜를 기준으로 몇주차까지 완전하게 계산가능한지 판별하고
    각 주차별로 초과근무, 급량비 내역 표출 및 월별 합산해서 표출할 수 있는 데이터 set 생성

    ++ 06/09 : 주별/월별 초과근무 최대 한도 설정하고 잘라내서 급량비 재산정
  */ 
  if(!req.session.data){ // 세션정보 존재하지 않으면 오류 표출
    res.status(404).send('세션 정보 없음'); 
  }
  console.log(exception_list);
  const {emp_id, start_day, end_day}=req.body; // 필터 정보 저장

  var temp_overtime='0000'; // 초과근무분 임시 저장 (월별)
  var temp_overtime_week='0000' // 초과근무분 임시 저장 (주별)
  var temp_week; // #주차 정보 저장

  // 초과근무 내역이 존재하거나 급량비 산정 대상인 데이터만 가져오기
  sql='SELECT a.EMP_ID AS EMP_ID, a.`NAME` AS `NAME`, a.YMD AS YMD, a.CAL_OVERTIME AS CAL_OVERTIME, a.CAL_MEAL AS CAL_MEAL,' +
  ' a.`INOUT` AS `INOUT`,'+
  ` b.over_std_time AS over_std_time from connect.ehr_cal a LEFT JOIN (SELECT EMP_ID, over_std_time FROM connect.gw_ehr_con)b`+
  ` ON a.EMP_ID=b.EMP_ID`+
  ` where a.emp_id=? and a.YMD>=? and a.YMD<=? and (a.CAL_OVERTIME!='0000' OR a.CAL_MEAL!='FALSE') order by EMP_ID, YMD`;
  
  db.query(sql,[emp_id, start_day, end_day]).spread(function(rows){ // 넘겨받은 emp_id로 직원 정보 조회
        
    result=JSON.parse(JSON.stringify(rows));
    new_result={
      "empInfo":[], // 일별 데이터
      "endOfWeek": lib.weekOfMonth(end_day) // 마지막 주 정보
    }
    var row=0;
    while(row<result.length){
      /* 
        result property
        CUTOFF : 월별/주별 초과근무 누적 초과되어 잘렸는지 여부
        EXCEPT : exception_list에 있는 직원인지 여부
        WEEK : 주차 정보
      */
      result[row]['WEEK']=lib.weekOfMonth(result[row]['YMD']);
      result[row]['CUTOFF']=false;
      result[row]['EXCEPT']=false;
      if(row==0){// 사번 맨처음 넣기
        tempEmpId=result[row]['EMP_ID'];
        temp_week=result[row]['WEEK'];
      }else { // 임시 사번이나 주차정보 변경되었을 때
        if(tempEmpId!=result[row]['EMP_ID']){
          tempEmpId=result[row]['EMP_ID'];
          temp_overtime='0000'
        }
        if(temp_week!=result[row['WEEK']]){
          temp_overtime_week='0000';
          temp_week=result[row]['WEEK'];
        }
      }

      // exception_list에 해당하면 별도의 처리과정을 거치지 않고 다음 데이터로 넘어감
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

      // 월별/주별 초과근무 누적
      temp_overtime=lib.addOverTime2(temp_overtime, result[row]["CAL_OVERTIME"]);
      temp_overtime_week=lib.addOverTime2(temp_overtime_week, result[row]["CAL_OVERTIME"]);

      if(temp_overtime_week>`1200`){// (주별 12h) 초과근무 한계 넘어간경우
        console.log('주별 초과근무시간 초과 발생')
        result[row]['CUTOFF']=true;
        result[row]["CAL_OVERTIME"]=lib.subOverTime(result[row]["CAL_OVERTIME"],lib.subOverTime(temp_overtime_week,`${result[row]["over_std_time"]}00`))
        
        /* 
          급량비 TRUE이면
          주말데이터면 2시간 넘겨야 급량비 TRUE
          평일이면 1시간 넘겨야 급량비 TRUE
        */
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
        temp_overtime=`${result[row]["over_std_time"]}00`; // 월별 초과근무 최대로 채워서 다른 데이터 지워버리기

        if(result[row]["CAL_MEAL"]=="TRUE"){ // 급량비 재산정
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
});

router.post('/cal_meal',function(req, res){
  /*
    팀별 급량비 조회 버튼 클릭 시 발생
    필터 정보(사번, 연/월)를 기준으로 중계DB의 connect.ehr_cal에서 데이터 가져오기

    최초에 해당 연월에 해당하는 ehr_cal 데이터 행 수와 날짜를 기준으로 몇주차까지 완전하게 계산가능한지 판별하고
    각 주차별로 초과근무, 급량비 내역 표출 및 월별 합산해서 표출할 수 있는 데이터 set 생성

    ++ 06/09 : 주별/월별 초과근무 최대 한도 설정하고 잘라내서 급량비 재산정
  */ 
  if(!req.session.data){ // 세션정보 존재하지 않으면 오류 표출
    res.status(404).send('세션 정보 없음'); 
  }
  const {dept_name, start_day, end_day}=req.body; // 필터 정보 저장

  var tempEmpId; // 임시사번 저장, 팀에 소속된 모든 사람들의 데이터 처리를 하기 위해서 사용
  var temp_overtime='0000'; // 초과근무분 임시 저장 (월별)
  var temp_overtime_week='0000' // 초과근무분 임시 저장 (주별)
  var temp_week; // #주차 정보 저장

  // 초과근무 내역이 존재하거나 급량비 산정 대상인 데이터만 가져오기
  sql='SELECT a.EMP_ID AS EMP_ID, a.`NAME` AS `NAME`, a.YMD AS YMD, a.CAL_OVERTIME AS CAL_OVERTIME, a.CAL_MEAL AS CAL_MEAL, a.ORG_NM as ORG_NM,' +
  ' a.`INOUT` AS `INOUT`,'+
  ` b.over_std_time AS over_std_time from connect.ehr_cal a LEFT JOIN (SELECT EMP_ID, over_std_time FROM connect.gw_ehr_con)b`+
  ` ON a.EMP_ID=b.EMP_ID`+
  ` where a.ORG_NM=? and a.YMD>=? and a.YMD<=? and (a.CAL_OVERTIME!='0000' OR a.CAL_MEAL!='FALSE') order by EMP_ID, YMD`;
  
  db.query(sql,[dept_name, start_day, end_day]).spread(function(rows){ // 넘겨받은 emp_id로 직원 정보 조회
    result=JSON.parse(JSON.stringify(rows));
    new_result={
      "empInfo":[], // result
      "endOfWeek": lib.weekOfMonth(end_day) // 마지막 주 정보
    }

    var row=0;
    while(row<result.length){
      result[row]['CUTOFF']=false;
      result[row]['EXCEPT']=false;
      result[row]['WEEK']=lib.weekOfMonth(result[row]['YMD']);
      
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
        console.log('주별 초과근무시간 cutoff')
        result[row]['CUTOFF']=true;

        // 초과근무시간 잘라나기
        result[row]["CAL_OVERTIME"]=lib.subOverTime(
          result[row]["CAL_OVERTIME"],lib.subOverTime(
            temp_overtime_week,`${result[row]["over_std_time"]}00`
          )
        )

        /* 
          급량비 산정 대상이면 잘린 초과근무 시간에 대해서 재산정
          주말데이터면 2시간 넘겨야 급량비 인정, 평일이면 1시간 넘겨야 급량비 인정
        */
        if(result[row]["CAL_MEAL"]=="TRUE"){
          if(lib.yyyymmddToDay(result[row]["YMD"])==0 || lib.yyyymmddToDay(result[row]["YMD"])==6){// 주말
            if(result[row]["CAL_OVERTIME"]<'0200'){
              result[row]["CAL_MEAL"]="FALSE";
            }
          }else{// 평일
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
    res.json(new_result);
  }).catch((err)=>{
    console.log(err);
    res.status(404).send('조회 시 오류가 발생하여 잠시 후에 다시 시도해주세요.');
  });
});

router.get('/error',function(req,res){ // users에서 발생하는 모든 에러 케이스 처리
  var error_msg=req.query.msg;
  res.render('error',{error:error_msg});
});

module.exports=router; //이거 안해주면 main.js app(express) 객체에서 라우터 접근 못함