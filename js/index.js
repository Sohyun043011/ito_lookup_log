
document.write("<script src='../ajax.js'></script>");
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
`1`
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
                    day = (result[i].YMD).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                    var week = ['일', '월', '화', '수', '목', '금', '토'];
                    var dayOfWeek = week[new Date(day).getDay()];

                    list.push({
                        "No":`${i+1}`,
                        "사번":result[i]['EMP_ID'],
                        "이름": result[i].NAME,
                        "날짜": result[i].YMD, 
                        "요일": dayOfWeek,
                        "근무유형":calShiftWorkDict3[`${result[i].WORK_TYPE}`],
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


    // 초과근무 및 급량비 산정 확인 버튼
    $('#check-overtime').on('click',function(e){
        var emp_id = $($('.mem-num')[0]).text();
        
        var date = $('#monthpicker1').val();
        // date = '2022-05'
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
       
        $.ajax({
            method:'POST',
            url:'/users/overtime',
            data:{'emp_id':emp_id,'start_day':start_day,'end_day':end_day},
            success:function(result){
                alert('성공')
                // result로 오는 정보 : 각 월에 해당하는 초과근무 및 급량비 산정 기록 
                // 
                console.log(result.endOfWeek);
                console.log(result.empInfo);
                console.log(result.empInfo.length);
                console.log(result.empInfo[0].WEEK);
                $('.summary-table').css('display','inline-table');
               
                // table생성 (end_of_week에 따라서)
                $('.week-tr').html('');
                $('.week-overtime').html('');
                $('.week-cal').html('');
                for(var i=0;i<result.endOfWeek;i++)
                {
                    $('.week-tr').append(`<th scope="col" class="${i+1}-week">${i+1}주차</th>`)
                    $('.week-overtime').append(`<th scope="col" class="${i+1}-overtime">${i+1}주차</th>`)
                    $('.week-cal').append(`<th scope="col" class="${i+1}-cal">${i+1}주차</th>`)
                }
                $('.week-tr').append(`<th scope="col">합산</th>`)
                $('.week-overtime').append(`<th scope="col">초과근무합산</th>`)
                $('.week-cal').append(`<th scope="col">급량비합산</th>`)
                $('.1-week').before(`<th scope="col" class="date"></th>`)
                $('.date').html(`${year}년 ${month}월`);
                $('.1-overtime').before(`<th scope="row" >초과근무</th>`)
                $('.1-cal').before(`<th scope="row">급량비</th>`)

                //각 주차에 대해 overtime 계산
                //0344: 3시간 44분
                
                var overtime = {1:[],2:[],3:[],4:[],5:[],6:[]}
                console.log(overtime['1']);
                var now_week = result.empInfo[0].WEEK;  //1주차에 대해서
                for(var m=0;m<result.empInfo.length-1;m++)
                {
                    // WEEK에 따라서 나누기
                    //급량비가 1주에 급량비 True몇개인지 * 8000
                    
                    if (result.empInfo[m].WEEK==now_week){
                        overtime[`${now_week}`].push(result.empInfo[m].CAL_OVERTIME);
                    }
                    else{
                        now_week = result.empInfo[m].WEEK;
                        overtime[`${now_week}`].push(result.empInfo[m].CAL_OVERTIME);
                       
                    }
                }
                console.log(overtime)
            },
            error:function(result){
                alert('실패')
            }
        })
    })

});


