function validateInterval(start_day, end_day){ // 기간 유효성 검사
    if(start_day==undefined||end_day==undefined||start_day==''||end_day==''){// 폼이 한쪽이라도 비어있을 때
        return false;
    }else if(start_day>end_day){
        return false;
    }else{
        return true;
    }
}
function addOverTime(list){
    var total=0;
    for(i in list){
        hours=parseInt(list[i].substring(0,2));
        minutes=parseInt(list[i].substring(2));
        totalMinutes=minutes+hours*60;
        total=totalMinutes+total; 
    }
    return total;
}
function addOverTimeTotal(dict){ //딕셔너리로 받아온 초과근무내역 합산해서 그대로 리턴
   
    for([key, value] of Object.entries(dict)){
        dict[key]=addOverTime(value);
    }
    return dict;
}
function hhmmToString(time){ // 초과근무 시간정보를 'hh시간 mm분' 문자열 형태로 변환
    time=parseInt(time)
    hour=Math.floor(time/60);
    minute=time%60;
    return hour+'시간 '+minute+'분'
}
function hhmmToString2(time){ // 초과근무 시간정보를 'hh시간 mm분' 문자열 형태로 변환
    time=parseInt(time)
    hour=Math.floor(time/100);
    minute=time%100;
    return hour+'시간 '+minute+'분'
}
function calMeal(dict){
    cal_dict ={};
    // week에 따라서 cal_meal 이 true인게 몇개 인지
    //cal_dict = {'1':1,'2':3,...} 형식으로 만들기
    for([key, value] of Object.entries(dict)){
        dict[key]
    }
    return dict;

}