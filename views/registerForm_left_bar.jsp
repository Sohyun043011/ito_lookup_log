<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!-- <form action=~~~> -->
<strong>
사번 :&nbsp;&nbsp;<input type="text" name="mberNm" id="mberNm" maxlength="16"	title="사번" style="height:20px;"><br/><br/>
유형 :&nbsp;
<select name="type" id="type" title="부서"  style="width:177px; height:28px;">
</select><br/><br/>
기간 :&nbsp;&nbsp;<br/><br/><input type="text" id="datepicker1" style="height:20px; width:185px;" dir="rtl"> &nbsp;부터 
<br/><br/><input type="text" id="datepicker2" style="height:20px; width:185px;" dir="rtl">&nbsp;&nbsp;까지</strong><br/><br/>
<input type="button" id="excelFileExport" value="엑셀 파일 다운로드"/>
<button id="search">조회하기</button>

<!-- </form> -->

