var express = require('express');
const { resolve } = require('url');
var router = express.Router();
var db=require('mysql2-promise')();
var db_config=require('../db_config');
var moment=require('moment');


// const nowDate = moment(target_day).utc(true);

router.get('/login/:emp_id',async function(req, res){
  /*1. 넘겨받은 사번정보 조회 후 있으면 세션 생성 단계 진입*/
  /*2. 세션 생성 (최대 N개, M분 만료) */
  db.configure(db_config['mysql']);
  sql='select count(*) as session_num from good.session_lookup_log'
  db.query(sql).spread(function(rows){ //세션 수 조회
    if(JSON.parse(JSON.stringify(rows))[0]['session_num']>=5){
      console.log('접속 중인 사용자가 너무 많습니다. 잠시 후에 시도해주세요.');
      res.send('<p>접속 중인 사용자가 너무 많습니다. 잠시 후에 시도해주세요.</p>');
    }
  })

  sql=`select EMP_ID, EMP_NM, ORG_NM from connect.hr_info where emp_id=${req.params.emp_id}`;

  db.query(sql).spread(function(rows){ // 넘겨받은 emp_id로 직원 정보 조회
    if (JSON.parse(JSON.stringify(rows)).length==1){
      console.log('직원정보가 존재합니다.');
      req.session.data=JSON.parse(JSON.stringify(rows))
      req.session.save(()=>{
        console.log('세션 생성 완료!');
        /*3. '/user/main/으로 redirect */
        res.redirect('/users/main');
    });
    } else{
      console.log('직원정보가 존재하지 않습니다.');
      res.send('<p>만료된 페이지<p>');
    };
  })
});

router.get('/main', function(req, res) { //
  /*
    메인 페이지
    1. 세션 수 확인 후 N개 미만일 때만 페이지 넘겨주기
    2. 세션 정보를 페이지단으로 넘겨주기(ejs) 또는 세션정보를 바탕으로 페이지 내부(client)에서 처리
    3. 출퇴근 기록 조회 | 급량비 및 초과근무 기록 조회의 2개의 tab으로 구성
    이후 main page 리턴
  */
  if(req&&req.session&&req.session.data){ // request, session, session data 유효성 검사
    res.render('main',{list:req.session.data[0]}) // 세션 정보를 ejs에 보내줌
  }
  else res.status(404).send('<p>오류</p>');
});


router.post('/inout',function(req, res){
  /*
    출퇴근 기록 조회 
    filter 안에 있는 내용(사번, 부서, interval)을 기반으로 중계DB의 connect.ehr_cal에서 값을 가져오는 쿼리를 실행
    이후 res.json으로 리턴
  */
  if(!req.session.data){
    res.status(404).send('<p>오류</p>');
  }
  const {emp_id, start_day, end_day}=req.body; // 사번, 시작일시, 종료일시

  db.configure(db_config['mysql']);
  sql='select EMP_ID, NAME, YMD, WORK_TYPE, FIX1, `INOUT`, PLAN1 from connect.ehr_cal where emp_id=? and ymd>=? and ymd<=?';

  db.query(sql,[emp_id, start_day, end_day]).spread(function(rows){ // 넘겨받은 emp_id로 직원 정보 조회
    console.log(JSON.parse(JSON.stringify(rows)));
    res.json(JSON.parse(JSON.stringify(rows)));
  });

});

router.post('/overtime',function(req, res){
  const weekOfMonth = function(target_day){
    m=moment(target_day).utc(true);
    target_week= m.week() - moment(m).startOf('month').week() + 1;
    if (m.day()==0 && target_week!=1){
        target_week=target_week-1;
    }
    return target_week;
  }
  /*
    급량비 및 초과근무 기록 조회
    filter 안에 있는 내용(사번, 부서, 연월 정보)을 기반으로 중계DB의 connect.ehr_cal에서 값을 가져오는 쿼리를 실행
    최초에 해당 연월에 해당하는 ehr_cal 데이터 행 수와 날짜를 기준으로 몇주차까지 완전하게 계산가능한지 판별하고
    각 주차별로 초과근무, 급량비 내역 표출 및 월별 합산해서 표출할 수 있는 데이터 set 생성
    이후 res.json으로 리턴
  */ 
  if(!req.session.data){
    res.status(404).send('<p>오류</p>');
  }

  const {emp_id, start_day, end_day}=req.body;
  console.log(req.body);
  db.configure(db_config['mysql']);
  sql='select EMP_ID, `NAME`, YMD, CAL_OVERTIME, CAL_MEAL from connect.ehr_cal where emp_id=? and ymd>=? and ymd<=?';

  db.query(sql,[emp_id, start_day, end_day]).spread(function(rows){ // 넘겨받은 emp_id로 직원 정보 조회
    result=JSON.parse(JSON.stringify(rows));
    for (row in result){
      console.log(result[row]['YMD'])
      result[row]['WEEK']=weekOfMonth(result[row]['YMD']);
    }
    console.log(result);
    res.json(result);
  });
});

module.exports=router;