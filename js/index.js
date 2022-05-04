
$(document).ready(function(){
    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd'
        ,showOtherMonths : true
        ,changeYear:true
        ,changeMonth:true
        ,minDate:"-6M",
        maxDate:"+0D",
        currentText: '오늘 날짜',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });
    $(function() {
        $("#datepicker1, #datepicker2").datepicker();
    });


    var currentYear = (new Date()).getFullYear();
    var currentMonth = (new Date()).getMonth();
    var startYear = currentYear-5;
    var options = {
            startYear: startYear,
            finalYear: currentYear,
            pattern: 'yyyy-mm',
            monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

    };
    $('#monthpicker1').monthpicker(options);

    //미래 월은 비활성화시키기
    var months=[];
    for(var i=currentMonth+2,j=0;i<=12;i++){
        months[j++]=i;
    }
    for(var i=0;i<$('#monthpicker1').length;i++){
        $($('#monthpicker1')[i]).monthpicker("disableMonths",months);
        $($('#monthpicker1')[i]).monthpicker().bind('monthpicker-change-year',function(e,year){
            var item = $(e.currentTarget);
            if(year==currentYear){
                $(item).monthpicker('disableMonths',months);
            }
            else{
                $(item).monthpicker('disableMonths',[]);
            }
        });
    }

    // 조회하기 버튼 누르면 table 표출
    $('#check-inout').on('click',function(e){
        var start_day = $('#datepicker1').val().replace(/\-/g,'');;
        var end_day = $('#datepicker2').val().replace(/\-/g,'');;
        var emp_id = $($('.mem-num')[0]).text();
        var check_list = {'start_day':start_day,'end_day':end_day,'emp_id':emp_id}
        // ajax로 날짜 두개, 사번 드림
       
        $.ajax({
            method:'POST',
            url:'/users/inout',
            data:check_list,
            success:function(result){
                alert('성공')
                console.log(result.length);
                var list =[];
                for(var i=0;i<result.length;i++)
                {
                    
                    list.push({
                        "No":`${i+1}`,
                        "사번":result[i]['EMP_ID'],
                        "이름": result[i].NAME,
                        "날짜": result[i].YMD, 
                        "요일": "화요일",
                        "근무유형":result[i].WORK_TYPE,
                        "출입시각":result[i].INOUT,
                        "확정시각":result[i].FIX1,
                        "계획시간":result[i].PLAN1
                    })
                }
             
                $(".inout-table").jsGrid({
                    width: "100%",
                    height: "100%",
                    sorting: true,
                    paging: true,
                    data: list,
                    pageSize: 15,
                    pageButtonCount: 5,
                    fields: [
                        { name: "No", type: "text",width:"35px"},
                        { name: "사번", type: "text"},
                        { name: "이름", type: "text"},
                        { name: "날짜", type: "text"},
                        { name: "요일", type: "text"},
                        { name:"근무유형", type:"text"},
                        { name:"출입시각", type:"text"},
                        { name:"확정시각", type:"text"},
                        { name:"계획시간", type:"text"}
        
                    ]
                });
                // res로 받은 정보들을 list에 넣음 
                console.log(result)
            },
            error:function(result){
                alert('실패')
            }
        })
        // db에서 받은 정보를 list에 넣을 것
        
    });
});


