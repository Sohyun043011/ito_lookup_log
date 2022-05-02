var express = require('express');
var router = express.Router();

router.get('/login',function(req, res){
  /*
    최초 로그인 메소드
    그룹웨어에서 '출퇴근기록 조회' 버튼 누르면 받아온 유저 데이터 정보와 hr_info를 대조하여 세션 생성 (N개 제한)
    세션은 M분의 시간이 지나면 만료되게 설정
    이후 '/'로 redirect
  */
});

router.get('/main', function(req, res) { //
  /*
    메인 페이지
    1. 세션 수 확인 후 N개 미만일 때만 페이지 넘겨주기
    2. 세션 정보를 페이지단으로 넘겨주기(ejs) 또는 세션정보를 바탕으로 페이지 내부(client)에서 처리
    3. 출퇴근 기록 조회 | 급량비 및 초과근무 기록 조회의 2개의 tab으로 구성
    이후 main page 리턴
  */
});

router.get('/inout',function(req, res){
  /*
    출퇴근 기록 조회 
    filter 안에 있는 내용(사번, 부서, interval)을 기반으로 중계DB의 connect.ehr_cal에서 값을 가져오는 쿼리를 실행
    이후 res.json으로 리턴
  */
});

router.get('/overtime',function(req, res){
  /*
    급량비 및 초과근무 기록 조회
    filter 안에 있는 내용(사번, 부서, 연월 정보)을 기반으로 중계DB의 connect.ehr_cal에서 값을 가져오는 쿼리를 실행
    최초에 해당 연월에 해당하는 ehr_cal 데이터 행 수와 날짜를 기준으로 몇주차까지 완전하게 계산가능한지 판별하고
    각 주차별로 초과근무, 급량비 내역 표출 및 월별 합산해서 표출할 수 있는 데이터 set 생성
    이후 res.json으로 리턴
  */
});

module.exports=router;