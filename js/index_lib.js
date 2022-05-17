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
    if(hour==0){
        if(minute==0){
            return '0시간';
        }else{
            return minute+'분';
        }
    }else{
        return hour+'시간 '+minute+'분'
    }
}
function hhmmToString2(time){ // 초과근무 시간정보를 'hh시간 mm분' 문자열 형태로 변환
    time=parseInt(time)
    hour=Math.floor(time/100);
    minute=time%100;
    if(hour==0){
        if(minute==0){
            return '0시간';
        }else{
            return minute+'분';
        }
    }else{
        return hour+'시간 '+minute+'분'
    }
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

function monthPicktoString(date){
    const words = date.split('-');
    const year = words[0];
    const month = words[1];
    words.push('01');
    const start_day = words.join('');   //시작날짜

    end_date = new Date(year,month,0);
    var end_year = end_date.getFullYear();
    var end_month = ("0"+(1+end_date.getMonth())).slice(-2);
    var e_day = ("0"+end_date.getDate()).slice(-2);
    var end_day = end_year+end_month+e_day;     //끝날짜
    
    return [start_day,end_day];
}
function dayFormatTranslate(ymd){//'yyyymmdd' to 'yyyy-mm-dd'
    return ymd.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
}

const workTypeDict={
    '0010':'시차출퇴근(7~16)', '0011':'시차출퇴근(7:30~16:30)', '0020':'시차출퇴근(8~17)',
    '0021':	'시차출퇴근(8:30~17:30)', '0030':'기본출퇴근(9~18)', '0031':'시차출퇴근(9:30~18:30)',
    '0040':	'시차출퇴근(10~19)', '0050':'평일', '0060':'휴일', '0070':'육아근로단축(7-15)',
    '0080':'육아근로단축(7-14)', '0090':'육아근로단축(7-13)', '0100':'육아근로단축(8-16)',
    '0110':'육아근로단축(8-15)', '0120':'육아근로단축(8-14)', '0130':'육아근로단축(9-17)',
    '0140':'육아근로단축(9-16)', '0150':'육아근로단축(9-15)', '0160':'육아근로단축(10-18)',
    '0170':'육아근로단축(10-17)', '0180':'육아근로단축(10-16)', '0190':'근로단축(7-14)',
    '0200':'근로단축(7-13)', '0210':'근로단축(8-15)', '0220':'근로단축(8-14)',
    '0230':'근로단축(9-16)', '0240':'근로단축(9-15)', '0250':'근로단축(10-17)',
    '0260':'근로단축(10-16)', '0270':'재택근무(7-16)', '0271':'재택근무(7:30~16:30)',
    '0280':'재택근무(8-17)', '0281':'재택근무(8:30~17:30)', '0290':'재택근무(9-18)',
    '0291':'재택근무(9:30-18:30)', '0300':'재택근무(10-19)', '0310':'육아근로단축재택근무(7-15)',
    '0320':'육아근로단축재택근무(7-14)', '0330':'육아근로단축재택근무(7-13)',
    '0340':'육아근로단축재택근무(8-16)', '0350':'육아근로단축재택근무(8-15)',
    '0360':'육아근로단축재택근무(8-14)', '0370':'육아근로단축재택근무(9-17)',
    '0380':'육아근로단축재택근무(9-16)', '0390':'육아근로단축재택근무(9-15)',
    '0400':'육아근로단축재택근무(10-18)', '0410':'육아근로단축재택근무(10-17)',
    '0420':'육아근로단축재택근무(10-16)', '0430':'임신기근로단축(9-16시)',
    '0440':'임신기근로단축(8-15시)', '0450':'임신기근로단축(10-17시)',
    '0460':'임신기근로단축재택근무(9-16시)', '0470':'임신기근로단축재택근무(8-15시)',
    '0480':'임신기근로단축재택근무(10-17시)'
}