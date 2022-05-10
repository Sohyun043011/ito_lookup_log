var express = require('express');
var router = express.Router();
var db=require('mysql2-promise')();
var db_config=require('../db_config');
var lib=require('../js/lib');
var path=require('path')
var fs=require('fs');
const { head } = require('request');
const xl = require('excel4node');

var serverNavCache;
var serverQueryCache; // db조회 시 임시로 보유, 추후에 excel download 기능 구현 시 사용할 예정
var admin='admin';
var users='users';



router.post('/login',function(req, res){ //data 키값 중 password라는 항목 받아오기
  /*
    관리자 페이지 로그인
    메인 페이지의 '관리자 로그인' 버튼 클릭, 암호 입력해서 서버 정보와 일치한다면 특수한 관리자 세션 생성
    별도의 세션 테이블을 유지하거나 세션 정보에 관리자임을 식별할 수 있는 정보를 넣기
    이후 '/admin'으로 redirect
  */
  if (!lib.isSession(req,users)){ // request, session, session data 유효성 검사
    res.status(404).send('<p>오류</p>'); //추후 수정
  }
  password=db_config.adminPageInfo.password; // 관리자 로그인 암호

  user_pw=req.body.password; // 패스워드 입력값

  //user_pw와 password가 일치한다면 세션 data에 isAdmin:true로 추가해주고 /admin/main페이지로 redirect
  if(user_pw==password){
    req.session.isAdmin=true;
    req.session.save(()=>{
      // /admin/main/으로 redirect */
      res.redirect('/admin/main');
    });
  }else{
    res.status(404).send('<p>비밀번호가 틀렸습니다.</p>');
  }
});
router.get('/logout',function(req,res){
 
  req.session.isAdmin=false;
  req.session.save(()=>{
    console.log('req');
    res.send('성공');
  })
})

router.get('/main', function(req, res) { //
  /*
    관리자 페이지
    1. 세션 수 확인 후 N개 미만일 때만 페이지 넘겨주기
    2. 세션 정보를 페이지단으로 넘겨주기(ejs) 또는 세션정보를 바탕으로 페이지 내부(client)에서 처리
  */
  console.log(req.session.isAdmin)
  if(req.session.isAdmin){
    res.render('admin',{list:req.session.data[0]}) // 세션 정보를 ejs에 보내줌
  }else res.status(404).send('<p>세션 오류</p>'); //추후 수정
});

router.get('/ehr/:type', function(req, res){
  /*
    ehr 업로드 폼 조회
    type : inout -> 출퇴근시각관리 form | cal_meal -> 급량비 form | edit -> 개인별근무일정변경 form
    이후 form 정보 리턴
  */
  if (!lib.isSession(req,admin)){ // request, session, session data 유효성 검사
    res.status(404).send('<p>오류</p>'); //추후 수정
  }
  var {emp_name, emp_id, org_nm, start_day, end_day}= req.query;

  var sql=` where ymd>=? and ymd<=?`;

  db.configure(db_config['mysql']);

  var sqlFilter=[ //preparedStatement 생성
    emp_name==undefined||''?'':' and `NAME`=?',
    emp_id==undefined||''?'':' and `emp_id`=?',
    org_nm==undefined||''?'':' and `org_nm`=?',
  ]
  var sqlList=[start_day, end_day];
  for(i of [emp_name, emp_id, org_nm]){ 
    if (i!=undefined&&i!=''){ 
      sqlList.push(i);
    }
  }
  for (i of sqlFilter){
    sql=sql+i;
  }

  switch(req.params.type){
    case 'inout': // 출퇴근 시각관리
      sql='select EMP_ID, NAME, YMD, WORK_TYPE, FIX1, `INOUT`, PLAN1 from connect.ehr_cal'+sql;
      
      //lib 특정 함수에 result 인수로 보내서 전처리 후 serverCache에 저장
    case 'cal_meal': // 급량비
      // sql=`select * from connect.ehr_cal where name=${emp_name} and emp_id=${emp_id} 
      // and org_nm=${org_nm} and ymd>=${start_day} and ymd<=${end_day}`
      db.query(sql,sqlList).spread(function(rows){ //세션 수 조회
        result=JSON.parse(JSON.stringify(rows)) 
        return result;
      }).then((result)=>{
        res.json(result);
      });
      break;
    case 'edit': // 개인별근무일정변경
      break;
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

  var {emp_name, emp_id, org_nm, start_day, end_day}= req.query;
  const xl = require('excel4node');
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Worksheet Name');
  // const headingColumnNames=[
  //   "NO","YMD","EMP_ID","NAME","ORG_NM","SHIFT_CD","WORK_TYPE","PLAN1","INOUT","FIX1","ERROR_INFO","DAYOFF1_TIME",
  //   "DAYOFF1_ID","DAYOFF2_TIME","DAYOFF2_ID","OVER1_TIME","OVER1_ID","BUSI_TRIP1_TIME","BUSI_TRIP1_ID","BUSI_TRIP2_TIME","BUSI_TRIP2_ID",
  //   "HOME_ID","ETC_INFO","ETC_ID","REWARD_TIME","REWARD_ID","CAL_OVERTIME","CAL_MEAL","RSN","date","COMMUTE_TYPE","DEL_YN"
  // ]
  
  var sql=``;

  db.configure(db_config['mysql']);

  var sqlFilter=[
    emp_name==undefined||''?'':' and `NAME`=?',
    emp_id==undefined||''?'':' and `emp_id`=?',
    org_nm==undefined||''?'':' and `org_nm`=?',
  ]
  var sqlList=[start_day, end_day];
  for(i of [emp_name, emp_id, org_nm]){
    if (i!=undefined&&i!=''){
      sqlList.push(i);
    }
  }
  switch(req.params.type){
    case 'inout': // 출퇴근 시각관리
      sql='select YMD, EMP_ID, `NAME`, ORG_NM, SHIFT_CD, WORK_TYPE, PLAN1, `INOUT`, FIX1, CAL_OVERTIME, CAL_MEAL from connect.ehr_cal'+
      ' where ymd>=? and ymd<=?'
      for (i of sqlFilter){
        sql=sql+i;
      }
      console.log(sql);

      db.query(sql,sqlList).spread(function(rows){ //세션 수 조회
        result=JSON.parse(JSON.stringify(rows));
        //lib 특정 함수에 result 인수로 보내서 전처리 후 serverCache에 저장
        return lib.makeInoutUploadForm(result);
      }).then((result)=>{
        result.write('testExcel.xlsx',res);
        // res.send('aewfewafw');
      })
      // .catch(error => console.log(error))
    case 'cal_meal': // 급량비
      
      break;
    case 'edit': // 개인별근무일정변경
      break;
    default:
      res.status(404).send('<p>오류</p>'); //추후 수정
  }
  
  
  
})

router.get('/test',function(req,res){
  lib.getInoutPrototype().then(function(wb){
    wb.write('testExcel.xlsx',res);
  });
  
//   ws.cell(1, 1)
//     .number(100)
//     .style(style);
 
//  // Set value of cell B1 to 200 as a number type styled with 

//   ws.cell(1, 2)
//     .number(200)
//     .style(style);
  
//   // Set value of cell C1 to a formula styled with paramaters of style
//   ws.cell(1, 3)
//     .formula('A1 + B1')
//     .style(style);
  
//   // Set value of cell A2 to 'string' styled with paramaters of style
//   ws.cell(2, 1)
//     .string('string')
//     .style(style);
  
//   // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
//   ws.cell(3, 1)
//     .bool(true)
//     .style(style)
//     .style({font: {size: 14}});
//   ws.cell(1,4,2,4,true).string('병합된 셀')
//   wb.write('testExcel.xlsx',res);
})

module.exports=router;