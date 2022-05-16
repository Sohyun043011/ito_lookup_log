var express = require('express');
var router = express.Router();
var db=require('mysql2-promise')();
var db_config=require('../db_config');
var lib=require('../js/lib');

var admin='admin';
var users='users';


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
    db.configure(db_config['mysql']);
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

  var sql=` where ymd>=? and ymd<=?`;

  db.configure(db_config['mysql']);
  var sqlList=[start_day, end_day];
  // 들어온 req.query에 따른 sql where 조건 수정하주기
  if (!(emp_name==undefined||emp_name=='')){
    sqlList.push(emp_name);
    sql=sql+` and NAME=?`; 
  }
  if (!(emp_id==undefined||emp_id=='')){
    sqlList.push(emp_id);
    sql=sql+` and EMP_ID=?`; 
  }
  
  if (!(org_nm==undefined||org_nm==''||org_nm=='부서를 선택해주세요')){ // select default option일 경우도 예외 처리
    sqlList.push(org_nm);
    sql=sql+` and ORG_NM=?`; 
  }
  switch(req.params.type){
    case 'inout': // 출퇴근 시각관리
      sql='select EMP_ID, NAME, YMD, WORK_TYPE, FIX1, `INOUT`, PLAN1 from connect.ehr_cal'+sql+` order by EMP_ID, YMD`;
      db.query(sql,sqlList).spread(function(rows){
        res.json(JSON.parse(JSON.stringify(rows)));
      })
      break;
    case 'cal_meal': // 급량비
      sql='select EMP_ID, NAME, YMD, CAL_OVERTIME, CAL_MEAL from connect.ehr_cal'+sql+` order by EMP_ID, YMD`;
      db.query(sql,sqlList).spread(function(rows){ //세션 수 조회
        result=JSON.parse(JSON.stringify(rows));
        new_result={
          "empInfo":[], // 일별 데이터
          "endOfWeek": lib.weekOfMonth(end_day) // 마지막 주 정보
        }
        for (row in result){
          result[row]['WEEK']=lib.weekOfMonth(result[row]['YMD']);
        }
        new_result["empInfo"]=result
        new_result=JSON.parse(JSON.stringify(new_result));
        return new_result;
      }).then((result)=>{
        res.json(result);
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
  console.log('download 시작');
  const xl = require('excel4node');
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Worksheet Name');
  
  var sql=``;

  var {emp_name, emp_id, org_nm, start_day, end_day}= req.query;

  var sql=` where ymd>=? and ymd<=?`;

  db.configure(db_config['mysql']);
  var sqlList=[start_day, end_day];
  
  if (!(emp_name==undefined||emp_name=='')){
    sqlList.push(emp_name);
    sql=sql+` and NAME=?`; 
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
        result.write('testExcel.xlsx',res);
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
        result.write('testExcel.xlsx',res);
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

router.get('/test',function(req,res){
  lib.getInoutPrototype().then(function(wb){
    wb.write('testExcel.xlsx',res);
  });
})

module.exports=router;