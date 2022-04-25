<%-- json 데이터 ajax.js에 넘겨줌 --%>

<%@ page language="java" contentType="text/plain; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.sql.*"%>
[
<%
	request.setCharacterEncoding("utf-8");
	String emp_id=request.getParameter("EMP_ID");
	String type=request.getParameter("TYPE");
	String sta_ymd=request.getParameter("STA_YMD");
	String end_ymd=request.getParameter("END_YMD");
	
	int is_emp_id=0;
	int is_type=0;
	
	if(type.equals("부서를 선택해주세요")){
		type="";
	}
	else{
		System.out.println("type is "+type);
	}
	System.out.println(emp_id);
	
	
	if(sta_ymd=="" && end_ymd==""){
		System.out.println("Non-plan");
		sta_ymd="00000000";
		end_ymd="99991231";
	}
	
	
	Connection conn=null;
	PreparedStatement pstmt=null;
	ResultSet rs=null;
	String sql="";
	String result="";
	try{
		//중계DB 연결 시작
		String jdbcUrl="jdbc:mysql://192.168.20.19/good";
		String dbID="root";
		String dbPass="Azsxdc123$";
				
		Class.forName("com.mysql.jdbc.Driver");
		conn=DriverManager.getConnection(jdbcUrl, dbID, dbPass);	
		
		//statement 생성		
		sql="select NUM, YMD, EMP_ID, NAME, ORG_NM, PLAN1, `INOUT`, FIX1, SHIFT_CD, WORK_TYPE from connect.ehr_cal where YMD>=? and YMD<=? ";
		if(emp_id!=""){
			System.out.println("emp_id exists");
			sql+="and EMP_ID=?";
			is_emp_id=1;
		}
		if(type!=""){
			System.out.println("type exists");
			sql+="and org_nm=?";
			is_type=1;
		}
		
		
		
		pstmt=conn.prepareStatement(sql);
		pstmt.setString(1, sta_ymd);
		pstmt.setString(2, end_ymd);
		if(emp_id!=""){ // emp_id binding
			pstmt.setString(3, emp_id);
		}
		if(type!=""){ // type binding
			if(is_emp_id==1){
				pstmt.setString(4, type);	
			}
			else{
				pstmt.setString(3, type);
			}
		}
		System.out.println(sql);
		
		rs=pstmt.executeQuery();
		
		while(rs.next()){
		
			result+="{";
			result+="\"num\":"+"\""+rs.getString("NUM").trim()+"\",";
			result+="\"ymd\":"+"\""+rs.getString("YMD").trim()+"\",";
			result+="\"emp_id\":"+"\""+rs.getString("EMP_ID").trim()+"\",";
			result+="\"name\":"+"\""+rs.getString("NAME").trim()+"\",";
			result+="\"org_nm\":"+"\""+rs.getString("ORG_NM").trim()+"\",";
			result+="\"shift_cd\":"+"\""+rs.getString("SHIFT_CD").trim()+"\",";
			result+="\"work_type\":"+"\""+rs.getString("WORK_TYPE").trim()+"\",";
			result+="\"plan\":"+"\""+rs.getString("PLAN1").trim()+"\",";
			result+="\"inout\":"+"\""+rs.getString("INOUT").trim()+"\",";
			result+="\"fix\":"+"\""+rs.getString("FIX1").trim()+"\"";
			result+="},";	
		}
		//마지막 , 지우기
		if(result.length()>0){
			result=result.substring(0, result.length()-1);
		}
		
		out.print(result);
		System.out.println(result);
	}catch(Exception e){
		e.printStackTrace();
	}finally{
		try{
			if(rs!=null) rs.close();
			if(pstmt!=null) pstmt.close();
			if(conn!=null) conn.close();
		}catch(Exception e){
			
		}
	}	
%>	
]