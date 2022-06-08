document.write("<script src='../js/index_lib.js'></script>");
// 관리자 페이지 js 
$(document).ready(function(){

    // jsgrid cell 변경시 감지하여
    let target = document.querySelector('.detail-table');
    let observer = new MutationObserver((mutations)=>{
        // alert('변경됨');
        $('.jsgrid-cell').each(function(index,obj){ 

            if(($(this).text()).includes("초과근무 일부 반영")){
                $(this).addClass('HL');
                $(this).addClass('fw-bold');
            }
        });
    })
    let option = {
        attributes: true,
        childList : true,
        subtree :true,
        characterData : true
    };

    observer.observe(target,option);

    // 로그아웃 버튼 
    $('#logout-button').click(function(){
        $.ajax({
            type:"GET",
            url:"/admin/logout",
            success:function(data){
                // console.log("success");
                location.replace('/users/main');
            }
        })
    })

    // EXCEL DOWNLOAD 버튼은 조회버튼을 눌렀을 때만 활성화
    $('.inout-download').prop('disabled', true);
    $('.cal-download').prop('disabled', true);

    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd'
        ,showOtherMonths : true
        ,changeYear:true
        ,changeMonth:true
        ,minDate:"-5M",
        maxDate:"+0D",
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
        $("#admin_datepicker1, #admin_datepicker2").datepicker();
    });
    var currentYear = (new Date()).getFullYear();
    var currentMonth = (new Date()).getMonth();
    var startYear = currentYear;
    var options = {
            startYear: startYear,
            finalYear: currentYear,
            pattern: 'yyyy-mm',
            monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

    };
    $('#admin_monthpicker1').monthpicker(options);
    $('#admin_monthpicker2').monthpicker(options);

    //미래 월은 비활성화시키기
    var months=[];
    for(var i=currentMonth+2,j=0;i<=12;i++){
        months[j++]=i;
    }
    for(var i=0;i<$('#admin_monthpicker1').length;i++){
        $($('#admin_monthpicker1')[i]).monthpicker("disableMonths",months);
        $($('#admin_monthpicker2')[i]).monthpicker("disableMonths",months);
        $($('#admin_monthpicker1')[i]).monthpicker().bind('monthpicker-change-year',function(e,year){
            var item = $(e.currentTarget);
            if(year==currentYear){
                $(item).monthpicker('disableMonths',months);
            }
            else{
                $(item).monthpicker('disableMonths',[]);
            }
        });
        $($('#admin_monthpicker1')[i]).monthpicker().bind('monthpicker-change-year',function(e,year){
            var item = $(e.currentTarget);
            if(year==currentYear){
                $(item).monthpicker('disableMonths',months);
            }
            else{
                $(item).monthpicker('disableMonths',[]);
            }
        });
    }

    //출퇴근기록 조회버튼
    $('#check-search').on('click',function(){
        $('.inout-table').html('');
        var emp_name = $('.empName').eq(0).val();
        var emp_id = $('.empID').eq(0).val();
        var org_nm = $('.select-dept').eq(0).val();
        var type = 'inout';
        var start_day = $('#admin_datepicker1').val().replace(/\-/g,'');;
        var end_day = $('#admin_datepicker2').val().replace(/\-/g,'');;
        if(!validateInterval(start_day,end_day))
        {
            Swal.fire({
                text:"기간을 다시 설정해주세요.",
                icon:'warning'
            }).then(()=>{
                $('#admin_datepicker1').val('');
                $('#admin_datepicker2').val('');
            });
            
            
        }else{
            $('#check-search').prop('disabled', true);
            var info = {'emp_name':emp_name,'emp_id':emp_id,'org_nm':org_nm,'start_day':start_day,'end_day':end_day};
            // ajax로 날짜 두개, 사번 드림
            $.ajax({
                type:"GET",
                url:`/admin/ehr/${type}`,
                data:info,
                success:function(result){
                    // console.log("success");
                    // console.log(result);
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
                            "날짜": day, 
                            "요일": dayOfWeek,
                            "근무유형":workTypeDict[`${result[i].WORK_TYPE}`],
                            "출입시각":result[i].INOUT,
                            "확정시각":result[i].FIX1,
                            "계획시간":result[i].PLAN1,
                            "비고":result[i].ERROR_INFO,
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
                            { name: "No", type: "number",width:"35px"},
                            { name: "사번", type: "text"},
                            { name: "이름", type: "text"},
                            { name: "날짜", type: "text"},
                            { name: "요일", type: "text"},
                            { name:"근무유형", type:"text"},
                            { name:"출입시각", type:"text"},
                            { name:"확정시각", type:"text"},
                            { name:"계획시간", type:"text"},
                            { name:"비고", type:"text"}
                        ]
                    })
                    $('a:contains("1")').click();
                    $('a:contains("First")').click();
                    // res로 받은 정보들을 list에 넣음 
                    $('#check-search').prop('disabled', false);
                },
                error:function(result){
                    // alert('실패')
                }
            }).then(()=>{
                $('.inout-download').prop('disabled', false);
                $('#admin_datepicker1').val(dayFormatTranslate(start_day));
                $('#admin_datepicker2').val(dayFormatTranslate(end_day));
            });

            
        }
    });

    $('a').on('click',function(){
        // alert('누름');
    })
    //급량비 조회버튼 - 기간 관련해서 수정
    $('#check-cal-search').on('click',function(){
        var emp_name = $('.empName').eq(1).val();
        $('.detail-table').html('');
        // console.log(emp_name);
        var emp_id = $('.empID').eq(1).val();
        var org_nm = $('.select-dept').eq(1).val();
        var type = 'cal_meal';      //급량비 조회
        var date = $('#admin_monthpicker1').val();

        if (date==''){
            Swal.fire({
                text:"기간을 다시 설정해주세요.",
                icon:'warning'
            }).then(()=>{
                $('#admin_monthpicker1').val('');
            })
        }
        else{
            const year = date.split('-')[0];
            const month = date.split('-')[1];
            var [start_day,end_day] = monthPicktoString(date);
    
            
            $('#check-cal-search').prop('disabled', true);
            var info = {'emp_name':emp_name,'emp_id':emp_id,'org_nm':org_nm,'start_day':start_day,'end_day':end_day};
            // ajax로 날짜 두개, 사번 드림
            $.ajax({
                    type:"GET",
                    url:`/admin/ehr/${type}`,
                    data:info,
                    success:function(result){
                        // console.log("cal success");
                        // console.log(result);
                        $('.summary-table').css('display','inline-table');
                   
                        // table생성 (end_of_week에 따라서)
                        $('.week-tr').html('');
                        $('.week-overtime').html('');
                        $('.week-cal').html('');
                        for(var i=0;i<result.endOfWeek;i++)
                        {
                            $('.week-tr').append(`<th scope="col" class="${i+1}-week week-col">${i+1}주차</th>`)
                            $('.week-overtime').append(`<th scope="col" class="${i+1}-overtime"></th>`)
                            $('.week-cal').append(`<th scope="col" class="${i+1}-cal week-col"></th>`)
                        }
                        $('.week-tr').append(`<th scope="col" class="week-col">합산</th>`)
                        // $('.week-tr').append(`<th scope="col" class="week-col">초과근무 기준시간</th>`)
                        $('.week-overtime').append(`<th scope="col" class="over-sum week-col"></th>`)
                        // $('.week-overtime').append(`<th rowspan="2" scope="col" class="over-std week-col">25</th>`)
                        $('.week-cal').append(`<th scope="col" class="cal-sum week-col"></th>`)
                        $('.week-tr>.1-week').before(`<th scope="col" class="date week-col"></th>`)
                        $('.week-tr>.date').html(`${year}년 ${month}월`);
                        $('.week-overtime>.1-overtime').before(`<th scope="row" class="week-col">초과근무</th>`)
                        $('.week-cal>.1-cal').before(`<th scope="row" class="week-col">급량비</th>`)
    
                        //각 주차에 대해 overtime,급량비 계산
                        
                        if(result.empInfo.length!=0){
                            var overtime = {1:[],2:[],3:[],4:[],5:[],6:[]};
                            var cal_meal = {1:0,2:0,3:0,4:0,5:0,6:0};
                            var now_week = result.empInfo[0].WEEK;  //1주차에 대해서
                            for(var m=0;m<result.empInfo.length;m++)
                            {
                                // WEEK에 따라서 나누기
                                //급량비가 1주에 급량비 True몇개인지 * 8000
                                
                                if (result.empInfo[m].WEEK==now_week){
                                    overtime[`${now_week}`].push(result.empInfo[m].CAL_OVERTIME);
                                    if(result.empInfo[m].CAL_MEAL=="TRUE"){
                                        // 트루이면 cal_meal에 넣기
                                        cal_meal[`${now_week}`]=cal_meal[`${now_week}`]+1;
                                    }
                                }
                                else{
                                    now_week = result.empInfo[m].WEEK;
                                    overtime[`${now_week}`].push(result.empInfo[m].CAL_OVERTIME);
                                    if(result.empInfo[m].CAL_MEAL=="TRUE"){
                                        // 트루이면 cal_meal에 넣기
                                        cal_meal[`${now_week}`]=cal_meal[`${now_week}`]+1;
                                    }
                                }
                            }
                            const overTimeTotal = addOverTimeTotal(overtime);   //분으로 나타내짐
                            var over_sum = 0;    
                            Object.values(overTimeTotal).forEach(function(ele,idx){
                                over_sum=over_sum+parseInt(ele);
                                ele_overtime =  hhmmToString(ele);
                                $(`.${idx+1}-overtime`).html(ele_overtime);
                            });
                            //초과근무 합산
                            over_sum = hhmmToString(over_sum);
                            $('.over-sum').html(over_sum);
        
                            var cal_sum=0;
                            Object.values(cal_meal).forEach(function(ele,idx){
                                //{'1':0,'2':3,...}
                                cal_count = ele*8000;
                                cal_sum+=cal_count;
                                const cal_string = (cal_count).toLocaleString('ko-KR');
                                $(`.week-cal>.${idx+1}-cal`).html(cal_string+'원');
                            });
        
                            //급량비 합산
                            $('.week-cal>.cal-sum').html(cal_sum.toLocaleString('ko-KR')+'원');
                            $('#check-overtime').prop('disabled', false);
        
        
                            var list =[];
                            var cnt = 1;
                            // console.log(result)
                            
                            for(var i=0;i<result.empInfo.length;i++)
                            {
                                day = (result.empInfo[i].YMD).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                                var week = ['일', '월', '화', '수', '목', '금', '토'];
                                var dayOfWeek = week[new Date(day).getDay()];
                                var cutOff = result.empInfo[i].CUTOFF;
                                var except = result.empInfo[i].EXCEPT;
                                var etc = '';
                                var time = result.empInfo[i].CAL_OVERTIME;
                                if (cutOff == true){
                                   
                                    etc = "(초과근무 일부 반영)"
                                }
                                if(except==true){
                                    time = result.empInfo[i].INOUT;
                                    etc = "(출퇴근기록 초과분으로 적용)"
                                }
                                
                                if(result.empInfo[i].CAL_OVERTIME!='0000' || result.empInfo[i].EXCEPT==true){
                                    list.push({
                                        "No":`${cnt}`,
                                        "사번":result.empInfo[i]['EMP_ID'],
                                        "이름": result.empInfo[i].NAME,
                                        "부서명":result.empInfo[i].ORG_NM,
                                        "날짜": day, 
                                        "요일": dayOfWeek,
                                        "주차": `${result.empInfo[i].WEEK}주차`,
                                       
                                        "급량비유무": (result.empInfo[i].CAL_MEAL=="TRUE") ? "O" : "X"
                                    });
                                    if(except==true){
                                        time=time.split('~').map(str=>{
                                            if(str==''){
                                                return '';
                                            }
                                            return str.substring(0,2)+':'+str.substring(2)
                                          }).join('~')
                                          list[i]['초과근무시간'] = `${time} ${etc}`;


                                    }
                                    else{
                                        list[i]['초과근무시간'] = `${hhmmToString2(time)} ${etc}`;
                                    }
                                    cnt++;
                                }
                            }
                        
                            $(".detail-table").jsGrid({
                                width: "100%",
                                height: "100%",
                                sorting: true,
                                paging: true,
                                data: list,
                                // pageSize: 15,
                                // pageButtonCount: 5,
                                fields: [
                                    { name: "No", type: "number",width:"35px"},
                                    { name: "사번", type: "text"},
                                    { name: "이름", type: "text"},
                                    { name: "부서명", type: "text"},
                                    { name: "날짜", type: "text"},
                                    { name: "요일", type: "text"},
                                    { name: "주차", type: "text"},
                                    { name: "초과근무시간", type: "text",width : "150px"},
                                    { name: "급량비유무", type: "text"}
                                ]
                            });

                            $('.jsgrid-cell').each(function(index,obj){ 

                                if(($(this).text()).includes("초과근무 일부 반영")){
                                    $(this).addClass('HL');
                                    $(this).addClass('fw-bold');
                                }
                            });
                            $('a:contains("1")').click();
                            $('a:contains("First")').click();
                            // res로 받은 정보들을 list에 넣음 
                        }
                        $('#check-cal-search').prop('disabled', false);
                    }
                }).then(()=>{
                    $('.cal-download').prop('disabled', false);
            
            });
            
        }
        
        
    });

    $('.inout-download').on('click', function(){
        var emp_name = $('.empName').eq(0).val();
        var emp_id = $('.empID').eq(0).val();
        var org_nm = $('.select-dept').eq(0).val();
        var type = 'inout';      //출퇴근조회
        var start_day = $('#admin_datepicker1').val().replace(/\-/g,'');;
        var end_day = $('#admin_datepicker2').val().replace(/\-/g,'');;
        if(!validateInterval(start_day,end_day))
        {
            Swal.fire({
                text:"기간을 다시 설정해주세요.",
                icon:'warning'
            }).then(()=>{
                $('#admin_datepicker1').val('');
                $('#admin_datepicker2').val('');
            });
            
        }else{
            $('#check-inout').prop('disabled', true);
            var emp_id = $($('.mem-num')[0]).text();    
            // ajax로 날짜 두개, 사번 드림
            window.open(`/admin/download/${type}?emp_name=${emp_name}&emp_id=${emp_id}&org_nm=${org_nm}`+
            `&start_day=${start_day}&end_day=${end_day}`);
        }
    })

    $('.cal-download').on('click', function(){
        var emp_name = $('.empName').eq(1).val().trim();
        // console.log(emp_name);
        var emp_id = $('.empID').eq(1).val();
        var org_nm = $('.select-dept').eq(1).val().trim();
        var type = 'cal_meal';      //급량비 조회
        var date = $('#admin_monthpicker1').val();
        const year = date.split('-')[0];
        const month = date.split('-')[1];
        var [start_day,end_day] = monthPicktoString(date);

        // ajax로 날짜 두개, 사번 드림
        window.open(`/admin/download/${type}?emp_name=${emp_name}&emp_id=${emp_id}&org_nm=${org_nm}`+
        `&start_day=${start_day}&end_day=${end_day}`);
    })

});

