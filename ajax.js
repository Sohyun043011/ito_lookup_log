
/*근로유형(shift_cd)*/
var calShiftWorkDict1={'0010':	'시차출퇴근', '0020':	'시차출퇴근','0030':	'시차출퇴근','0040':	'시차출퇴근','0060':	'육아기근로단축','0070':	'육아기근로단축','0080':	'육아기근로단축','0090':	'육아기근로단축',
'0100':	'육아기근로단축','0110':	'육아기근로단축','0120':	'육아기근로단축','0130':	'육아기근로단축','0140':	'육아기근로단축','0150':	'육아기근로단축','0160':	'육아기근로단축','0170':	'육아기근로단축','0180':	'육아기근로단축',
'0190':	'시간선택제근로단축','0200':	'시간선택제근로단축','0210':	'시간선택제근로단축','0220':	'시간선택제근로단축','0230':	'시간선택제근로단축','0240':	'시간선택제근로단축','0250':	'시간선택제근로단축','0260':	'시간선택제근로단축',
'0430':	'임신기근로단축','0440':	'임신기근로단축','0450':	'임신기근로단축'} 

/*근무조(shift_cd)*/
var calShiftWorkDict2={'0010':'시차출퇴근(7~16)','0020':	'시차출퇴근(8~17)','0030':	'기본출퇴근(9~18)','0040':	'시차출퇴근(10~19)','0050':	'선택출퇴근제','0060':	'파견직(9~18)','0070':	'육아근로단축(7-15)',
'0080':	'육아근로단축(7-14)','0090':	'육아근로단축(7-13)','0100':	'육아근로단축(8-16)','0110':	'육아근로단축(8-15)','0120':	'육아근로단축(8-14)','0130':	'육아근로단축(9-17)','0140':	'육아근로단축(9-16)',
'0150':	'육아근로단축(9-15)','0160':	'육아근로단축(10-18)','0170':	'육아근로단축(10-17)','0180':	'육아근로단축(10-16)','0190':	'근로단축(7-14)','0200':	'근로단축(7-13)','0210':	'근로단축(8-15)','0220':	'근로단축(8-14)',
'0230':	'근로단축(9-16)','0240':	'근로단축(9-15)','0250':	'근로단축(10-17)','0260':	'근로단축(10-16)','0430':	'임신기근로단축(9-16시)','0440':	'임신기근로단축(8-15시)','0450':	'임신기근로단축(10-17시)'}

/*근무유형(work_type)*/
var calShiftWorkDict3={'0010':	'시차출퇴근(7~16)','0020':	'시차출퇴근(8~17)','0030':	'기본출퇴근(9~18)','0040':	'시차출퇴근(10~19)','0050':	'평일','0060':	'휴일','0070':	'육아근로단축(7-15)','0080':	'육아근로단축(7-14)',
'0090':	'육아근로단축(7-13)','0100':	'육아근로단축(8-16)','0110':	'육아근로단축(8-15)','0120':	'육아근로단축(8-14)','0130':	'육아근로단축(9-17)','0140':	'육아근로단축(9-16)','0150':	'육아근로단축(9-15)',
'0160':	'육아근로단축(10-18)','0170':	'육아근로단축(10-17)','0180':	'육아근로단축(10-16)','0190':	'근로단축(7-14)','0200':	'근로단축(7-13)','0210':	'근로단축(8-15)','0220':	'근로단축(8-14)','0230':	'근로단축(9-16)',
'0240':	'근로단축(9-15)','0250':	'근로단축(10-17)','0260':	'근로단축(10-16)','0270':	'재택근무(7-16)','0280':	'재택근무(8-17)','0290':	'재택근무(9-18)','0300':	'재택근무(10-19)','0310':	'육아근로단축재택근무(7-15)',
'0320':	'육아근로단축재택근무(7-14)','0330':	'육아근로단축재택근무(7-13)','0340':	'육아근로단축재택근무(8-16)','0350':	'육아근로단축재택근무(8-15)','0360':	'육아근로단축재택근무(8-14)','0370':	'육아근로단축재택근무(9-17)',
'0380':	'육아근로단축재택근무(9-16)','0390':	'육아근로단축재택근무(9-15)','0400':	'육아근로단축재택근무(10-18)','0410':	'육아근로단축재택근무(10-17)','0420':	'육아근로단축재택근무(10-16)','0430':	'임신기근로단축(9-16시)',
'0440':	'임신기근로단축(8-15시)','0450':	'임신기근로단축(10-17시)','0460':	'임신기근로단축재택근무(9-16시)','0470':	'임신기근로단축재택근무(8-15시)','0480':	'임신기근로단축재택근무(10-17시)'} 

/*부서 리스트*/
var deptList=["송도컨벤시아사업단","기획조정실","관광마케팅실","전시마케팅팀","관광산업실","MICE뷰로","축제이벤트팀","사옥이전TF","컨벤션마케팅팀","섬발전지원센터","관광인프라팀",
"경영지원팀","국내관광팀","안전감사팀","의료웰니스팀","2022경영평가TF","운영팀","전략기획팀","스마트관광팀","해외마케팅팀","전시사업팀","관광기업지원센터","고객홍보팀"];

function buttonDisable(){
	$("#search").attr("disabled", true);
	$("#btn_search2").attr("disabled", true);
	$("#btn_download").attr("disabled", true);
}

function buttonEnable(){
	$("#search").attr("disabled", false);
	$("#btn_search2").attr("disabled", false);
	$("#btn_download").attr("disabled", false);
} 

function calcDay(dateString){
	if(dateString==""){
		return "X";
	}
	var week=['일','월','화','수','목','금','토'];
	console.log(dateString);
	var formatted_date=dateString.substr(0,4)+'-'+dateString.substr(4,2)+'-'+dateString.substr(6,8);
	return week[new Date(formatted_date).getDay()];
}

function calTime_start(timeString){ /*12:34 중 12 */
	if (timeString=="None" || timeString=="ERROR" || timeString=="" || timeString=="~"){
		return "<td></td>";
	}
	else if(timeString.length!=9){
		return "<td></td>";
	}
	else{
		return "<td>"+timeString.substr(0,2)+":"+timeString.substr(2,2)+"</td>";
	}
}

function calTime_end(timeString){ /*12:34 중 34 */
	if (timeString=="None" || timeString=="ERROR" || timeString=="" || timeString=="~"){
		return "<td></td>";
	}
	else if(timeString.length!=9){
		return "<td></td>";
	}
	else{
		return "<td>"+timeString.substr(5,2)+":"+timeString.substr(7,2)+"</td>";
	}
}


function calOvertime(timeString, var_shift_cd, var_work_type){ //평일 초과근무인지 주말 초과근무인지 조사
	//1 : weekends, 2 : weekdays
	if(var_work_type=="0060"){
		return 1;
	}
	else return 2;
}

function overtimeToFloat(timeString){ //4자리 시간값 문자열을 부동 소수점으로 변환
	return parseFloat(timeString.substr(0,2)+"."+timeString.substr(2,2)).toFixed(2);

}


function commuteLog(){ // 출퇴근기록 조회
	console.log("commuteLog started");
			
	$("#table_area").empty(); //조회 전 right_contents 프레임의 table_area 비워주기
	var emp_id=$("#mberNm").val();
	var type=$("#type option:selected").text();
	var sta_ymd=$("#datepicker1").val().replace(/\-/g,'');
	var end_ymd=$("#datepicker2").val().replace(/\-/g,'');
	
	buttonDisable();

	console.log(sta_ymd, end_ymd);
	console.log(type);
	
	if((sta_ymd==""&&end_ymd!="")||(sta_ymd!=""&&end_ymd=="")){ //기간이 한쪽만 설정되어 있을 때
		alert('시작기간과 종료기간을 모두 설정하시기 바랍니다.');
		buttonEnable();
		return;
	}	
	
	else if(sta_ymd>end_ymd){ //종료기간이 시작기간보다 빠를 때
		alert('종료기간이 시작기간보다 빠릅니다.');
		buttonEnable();
		return;
	}
	
	

	$.ajax({
		type:"post",
		url:"registerForm_json.jsp",
		data:{
			"EMP_ID":emp_id,
			"TYPE":type,
			"STA_YMD":sta_ymd,
			"END_YMD":end_ymd
		},
		dataType:"json",
		success:function(data){	
			console.log("success!");
			console.log(data)
			
			var str="";
			str="<table class=\"lookup\">";
			str+="<tr>    <th rowspan=\"2\">No</th>    <th rowspan=\"2\">사번(*)</th>    <th rowspan=\"2\">성명</th>    <th rowspan=\"2\">현재조직</th>    <th rowspan=\"2\" style=\"width:200px;\">근무일(*)</th>    <th rowspan=\"2\">요일</th>    <th rowspan=\"2\">근로유형</th>		       <th rowspan=\"2\">근무조</th>    <th rowspan=\"2\">근무유형</th>    <th rowspan=\"2\">마감여부</th>    <th colspan=\"4\">출퇴근계획</th>    <th colspan=\"6\">출퇴근기록(본인)</th>    <th colspan=\"4\">출퇴근신청</th>    <th colspan=\"2\">출퇴근기록기</th>    <th colspan=\"4\">확정</th>    <th rowspan=\"2\">비고</th></tr><tr>	<th>출근일자</th> <!-- 출퇴근계획 -->    <th>출근시간</th> <!-- 출퇴근계획 -->    <th>퇴근일자</th> <!-- 출퇴근계획 -->    <th>퇴근시각</th> <!-- 출퇴근계획 -->    <th>출근일자</th> <!-- 출퇴근기록(본인) -->    <th>출근시간</th> <!-- 출퇴근기록(본인) -->    <th>출근입력시각</th> <!-- 출퇴근기록(본인) -->    <th>퇴근일자</th> <!-- 출퇴근기록(본인) -->    <th>퇴근시각</th> <!-- 출퇴근기록(본인) -->    <th>퇴근입력시각</th> <!-- 출퇴근기록(본인) -->    <th>출근일자</th> <!-- 출퇴근신청 -->    <th>출근시간</th> <!-- 출퇴근신청 -->    <th>퇴근일자</th> <!-- 출퇴근신청 -->    <th>퇴근시각</th> <!-- 출퇴근신청 -->    <th>출근시간</th> <!-- 출퇴근기록기 -->    <th>퇴근시각</th> <!-- 출퇴근기록기 -->    <th>출근일자</th> <!-- 확정 -->    <th>출근시간</th> <!-- 확정 -->    <th>퇴근일자</th> <!-- 확정 -->    <th>퇴근시각</th> <!-- 확정 --></tr>";
			$.each(data, function(index, entry){ 
				console.log("DATA CREATED");
				str+="<tr>";
				str+="<td>"+entry.num+"</td>";
				str+="<td>"+entry.emp_id+"</td>";
				str+="<td>"+entry.name+"</td>";
				str+="<td>"+entry.org_nm+"</td>";
				str+="<td>"+entry.ymd+"</td>";
				str+="<td>"+calcDay(entry.ymd)+"</td>";
				str+="<td>"+calShiftWorkDict1[entry.shift_cd]+"</td>"; /* 근로유형 */
				str+="<td>"+calShiftWorkDict2[entry.shift_cd]+"</td>"; /* 근무조 */
				str+="<td>"+calShiftWorkDict3[entry.work_type]+"</td>"; /* 근무유형 */
				str+="<td>"+"N"+"</td>";
				str+="<td>"+entry.ymd+"</td>"; /* 출퇴근계획 */
				str+=calTime_start(entry.plan); /* 출퇴근계획 */
				str+="<td>"+entry.ymd+"</td>"; /* 출퇴근계획 */
				str+=calTime_end(entry.plan) /* 출퇴근계획 */
				str+="<td></td>"; /* 출퇴근기록(본인) */
				str+="<td></td>"; /* 출퇴근기록(본인) */
				str+="<td></td>"; /* 출퇴근기록(본인) */
				str+="<td></td>"; /* 출퇴근기록(본인) */
				str+="<td></td>"; /* 출퇴근기록(본인) */
				str+="<td></td>"; /* 출퇴근기록(본인) */
				str+="<td></td>"; /* 출퇴근신청 */
				str+="<td></td>"; /* 출퇴근신청 */
				str+="<td></td>"; /* 출퇴근신청 */
				str+="<td></td>"; /* 출퇴근신청 */
				str+=calTime_start(entry.inout); /* 출퇴근기록기 */
				str+=calTime_end(entry.inout); /* 출퇴근기록기 */
				str+="<td>"+entry.ymd+"</td>"; /* 확정 */
				str+=calTime_start(entry.fix) /* 확정 */
				str+="<td>"+entry.ymd+"</td>"; /* 확정 */
				str+=calTime_end(entry.fix); /* 확정 */
				str+="<td></td>"; /* 비고 */
				str+="</tr>";
			})
			
			str+="</table>";
			console.log(str)
			
			//$(".right-container").animate({'width':'1275px'});	
			//$(".right-container").addClass('ani-time');
			//$(".right-container").css('transition','all 0.5s');	
			
			//$(".right-container").css('width','1275px');	//right container 늘이기
			//$(".lookup").css('table-layout','fixed');
			
			
			$("#table_area").append(str);
			buttonEnable();
		},
		error:function(request, error){
			console.log(request.status+"\n"+request.responseText+"\n"+error);
			buttonEnable();
		}
	});
};


function overtimeLog(){ // 급량비 조회하기
	console.log("commuteLog started");
	
	$("#table_area").empty(); //조회 전 right_contents 프레임의 table_area 비워주기
	var emp_id=$("#mberNm").val();
	var type=$("#type option:selected").text();
	var sta_ymd=$("#datepicker1").val().replace(/\-/g,'');
	var end_ymd=$("#datepicker2").val().replace(/\-/g,'');
	
	buttonDisable();

	console.log(sta_ymd, end_ymd);
	console.log(type);
	
	if((sta_ymd==""&&end_ymd!="")||(sta_ymd!=""&&end_ymd=="")){ //기간이 한쪽만 설정되어 있을 때
		alert('시작기간과 종료기간을 모두 설정하시기 바랍니다.');
		buttonEnable();
		return;
	}	
	
	else if(sta_ymd>end_ymd){ //종료기간이 시작기간보다 빠를 때
		alert('종료기간이 시작기간보다 빠릅니다.');
		buttonEnable();
		return;
	}
		
	$.ajax({
		type:"post",
		url:"registerForm_json2.jsp",
		data:{
			"EMP_ID":emp_id,
			"TYPE":type,
			"STA_YMD":sta_ymd,
			"END_YMD":end_ymd
		},
		dataType:"json",
		success:function(data){	
			console.log("success!");
			console.log(data)
			//$(".left-container").css('margin-left','-290px');	//출퇴근 조회 버튼 누를 시, 왼쪽으로 왼쪽 컨테이너 이동(애니메이션)
			//$(".left-container").animate({marginLeft:'-290px'});	
			//$(".left-container").css('transition','all 0.5s');
			
			var str="";
			str="<table class=\"lookup\">";
			str+="<tr><th>No</th><th>사번(*)</th><th>성명</th><th>조직</th><th>근무일(*)</th><th>평일연장</th><th>평일야간</th><th>휴일</th><th>휴일연장</th><th>휴일야간</th><th>합계</th><th>사유</th></tr>";
			
			var cnt=0;
		
			
			$.each(data, function(index, entry){
				console.log("success");
				cnt++; 
				
				str+="<tr>";
				str+="<td>"+cnt+"</td>"; /* No */
				str+="<td>"+entry.emp_id+"</td>"; /*사번*/
				str+="<td>"+entry.name+"</td>";/*성명*/
				str+="<td>"+entry.org_nm+"</td>";/*조직*/
				str+="<td>"+entry.ymd+"</td>";/*근무일*/
				if(calOvertime(entry.cal_overtime, entry.shift_cd, entry.work_type)==1){ //주말근무일때
					str+="<td>0.00</td>";/*평일연장*/
					str+="<td>0.00</td>";/*평일야간*/
					str+="<td>"+overtimeToFloat(entry.cal_overtime)+"</td>";/*휴일*/
					str+="<td>0.00</td>";/*휴일연장*/
					str+="<td>0.00</td>";/*휴일야간*/
				}
				else{//평일근무일때
					str+="<td>"+overtimeToFloat(entry.cal_overtime)+"</td>";/*평일연장*/
					str+="<td>0.00</td>";/*평일야간*/
					str+="<td>0.00</td>";/*휴일*/
					str+="<td>0.00</td>";/*휴일연장*/
					str+="<td>0.00</td>";/*휴일야간*/
				}
				str+="<td>"+overtimeToFloat(entry.cal_overtime)+"</td>";/*합계*/
				str+="<td></td>";/*사유*/
				str+="</tr>";
			})
			
			str+="</table>";
			console.log(str)
			
			//$(".right-container").animate({'width':'1275px'});	
			//$(".right-container").addClass('ani-time');
			//$(".right-container").css('transition','all 0.5s');	
			
			//$(".right-container").css('width','1275px');	//right container 늘이기
			//$(".lookup").css('table-layout','fixed');
			
			
			$("#table_area").append(str);
			buttonEnable();
		},
		error:function(request, error){
			console.log(request.status+"\n"+request.responseText+"\n"+error);
			buttonEnable();
		}
	});
}


$(function(){
	$("#search").click(function(){
		buttonDisable();
		
		setTimeout(commuteLog,0);
		
	});
	$("#btn_search2").click(function(){
		buttonDisable();
		
		setTimeout(overtimeLog,0);
	});
		
});

$(document).ready(function(){
	$("#btn_download").click(function(){
		$("#table_area").excelexportjs({
			containerid:"table_area",
			datatype:'table'
		});
	});
	deptList.forEach(function(item){
	
		$("#type").append("<option value=''>"+item+"</option>");
		console.log("<option>"+item+"</option>");
	});
});
	
	



			
