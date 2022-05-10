document.write("<script src='../js/index_lib.js'></script>");
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
    $('#monthpicker2').monthpicker(options);

    //미래 월은 비활성화시키기
    var months=[];
    for(var i=currentMonth+2,j=0;i<=12;i++){
        months[j++]=i;
    }
    for(var i=0;i<$('#monthpicker1').length;i++){
        $($('#monthpicker1')[i]).monthpicker("disableMonths",months);
        $($('#monthpicker2')[i]).monthpicker("disableMonths",months);
        $($('#monthpicker1')[i]).monthpicker().bind('monthpicker-change-year',function(e,year){
            var item = $(e.currentTarget);
            if(year==currentYear){
                $(item).monthpicker('disableMonths',months);
            }
            else{
                $(item).monthpicker('disableMonths',[]);
            }
        });
        $($('#monthpicker2')[i]).monthpicker().bind('monthpicker-change-year',function(e,year){
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
        if(!validateInterval(start_day,end_day))
        {
            alert('기간을 다시 설정해주세요.');
            $('#datepicker1').val('');
            $('#datepicker2').val('');
            
        }else{
            $('#check-inout').prop('disabled', true);
            var emp_id = $($('.mem-num')[0]).text();    
            var check_list = {'start_day':start_day,'end_day':end_day,'emp_id':emp_id}
            // ajax로 날짜 두개, 사번 드림
        
            $.ajax({
                method:'POST',
                url:'/users/inout',
                data:check_list,
                success:function(result){
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
                    $('#check-inout').prop('disabled', false);
                    $('a:contains("1")').click();
                },
                error:function(result){
                    alert('실패')
                }
            })
        }
        
        // db에서 받은 정보를 list에 넣을 것
        
    });


    // 초과근무 및 급량비 산정 확인 버튼
    $('#check-overtime').on('click',function(e){
        $('#check-overtime').prop('disabled', true);
       
        var emp_id = $($('.mem-num')[0]).text();
        var date = $('#monthpicker1').val();
        // date = '2022-05'
        const year = date.split('-')[0];
        const month = date.split('-')[1];
        var [start_day,end_day] = monthPicktoString(date);
       
        $.ajax({
            method:'POST',
            url:'/users/overtime',
            data:{'emp_id':emp_id,'start_day':start_day,'end_day':end_day},
            success:function(result){
                // result로 오는 정보 : 각 월에 해당하는 초과근무 및 급량비 산정 기록 
                // 
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
                $('.week-overtime').append(`<th scope="col" class="over-sum">초과근무합산</th>`)
                $('.week-cal').append(`<th scope="col" class="cal-sum">급량비합산</th>`)
                $('.week-tr>.1-week').before(`<th scope="col" class="date"></th>`)
                $('.week-tr>.date').html(`${year}년 ${month}월`);
                $('.week-overtime>.1-overtime').before(`<th scope="row" >초과근무</th>`)
                $('.week-cal>.1-cal').before(`<th scope="row" >급량비</th>`)

                //각 주차에 대해 overtime,급량비 계산
                
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
                    $(`.week-cal>.${idx+1}-cal`).html(cal_string);
                });

                //급량비 합산
                $('.week-cal>.cal-sum').html(cal_sum.toLocaleString('ko-KR'));
                $('#check-overtime').prop('disabled', false);
                
                // detail table 표출
                var over_list = [];
                for(var i=0;i<result.empInfo.length;i++)
                {
                        day = (result.empInfo[i].YMD).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                        var week = ['일', '월', '화', '수', '목', '금', '토'];
                        var dayOfWeek = week[new Date(day).getDay()];

                        over_list.push({
                            "No":`${i+1}`,
                            "사번":result.empInfo[i]['EMP_ID'],
                            "이름": result.empInfo[i].NAME,
                            "날짜": day, 
                            "요일": dayOfWeek,
                            "주차": `${result.empInfo[i].WEEK}주차`,
                            "초과근무시간": hhmmToString2(result.empInfo[i].CAL_OVERTIME),
                            "급량비유무": (result.empInfo[i].CAL_MEAL=="TRUE") ? "O" : "X"
                        });
                }

                $('.overtime-table').jsGrid({
                    height:"70%",
                    sorting: true,
                    paging:true,
                    autoload:true,
                    data: over_list,
                    fields: [
                        { name: "No", type: "text",width:"35px"},
                        { name: "사번", type: "text"},
                        { name: "이름", type: "text"},
                        { name: "날짜", type: "text"},
                        { name: "요일", type: "text"},
                        { name: "주차", type: "text"},
                        { name: "초과근무시간", type: "text"},
                        { name: "급량비유무", type: "text"}
                    ]
                });
                $('a:contains("1")').click();
            },
            error:function(result){
                alert('실패')
            }
        })
    })

    //팀별 급량비 조회하기 버튼
    $('#check-team-overtime').on('click',function(e){
        $('#check-team-overtime').prop('disabled', true);
        
        var dept_name = $($('.mem-dept')[0]).text();

        var date = $('#monthpicker2').val();
        const year = date.split('-')[0];
        const month = date.split('-')[1];
        // date = '2022-05'
        var [start_day,end_day] = monthPicktoString(date);

        $.ajax({
            method:'POST',
            url:'/users/cal_meal',
            data:{'dept_name':dept_name,'start_day':start_day,'end_day':end_day},
            success:function(result){
                // 요약 table 출력
                $('.team-summary-table').css('display','inline-table');
                $('.team-week-tr').html('');
                $('.team-week-cal').html('');
                for(var i=0;i<result.endOfWeek;i++)
                {
                    $('.team-week-tr').append(`<th scope="col" class="${i+1}-week">${i+1}주차</th>`)
                    $('.team-week-cal').append(`<th scope="col" class="${i+1}-cal">${i+1}주차</th>`)
                }
                $('.team-week-tr').append(`<th scope="col">합산</th>`) 
                $('.team-week-cal').append(`<th scope="col" class="cal-sum">급량비합산</th>`)
                $('.team-week-tr>.1-week').before(`<th scope="col" class="date"></th>`)
                $('.team-week-tr>.date').html(`${year}년 ${month}월`);
                $('.team-week-cal>.1-cal').before(`<th scope="row" >급량비</th>`)
                
                var team_cal_meal = {1:0,2:0,3:0,4:0,5:0,6:0};
                var now_week = result.empInfo[0].WEEK;

                for(var m=0;m<result.empInfo.length;m++)
                {
                    if(result.empInfo[m].WEEK==now_week){
                        if(result.empInfo[m].CAL_MEAL=="TRUE"){
                            // 트루이면 cal_meal에 넣기
                            team_cal_meal[`${now_week}`]=team_cal_meal[`${now_week}`]+1;
                        }
                    }
                    else{
                        now_week = result.empInfo[m].WEEK;
                        if(result.empInfo[m].CAL_MEAL=="TRUE"){
                            // 트루이면 cal_meal에 넣기
                            team_cal_meal[`${now_week}`]=team_cal_meal[`${now_week}`]+1;
                        }
                    }
                }
                var cal_sum=0;
                Object.values(team_cal_meal).forEach(function(ele,idx){
                    //{'1':0,'2':3,...}
                    cal_count = ele*8000;
                    cal_sum+=cal_count;
                    const cal_string = (cal_count).toLocaleString('ko-KR');
                    $(`.team-week-cal>.${idx+1}-cal`).html(cal_string);
                });

                //급량비 합산
                $('.team-week-cal>.cal-sum').html(cal_sum.toLocaleString('ko-KR'));
                $('#check-team-overtime').prop('disabled', false);
                
                // detail table 표출
                var team_over_list = [];
                var count_emp = {};  //각 날짜에 해당하는 calmeal=true인 총 인원수
                var end_d = parseInt(end_day.substring(6,8));
            
                for(var i=0;i<end_d;i++)
                {  
                    
                    count_emp[parseInt(start_day)+i] = 0;
                }
                var count_sum =0;

                for(var i=1;i<result.empInfo.length;i++)
                {
                    if(result.empInfo[i].CAL_MEAL=="TRUE")
                    {
                        if(!count_emp[`${result.empInfo[i].YMD}`])
                        {
                            count_emp[`${result.empInfo[i].YMD}`]=1;
                        }
                        else{
                            count_emp[`${result.empInfo[i].YMD}`]=count_emp[`${result.empInfo[i].YMD}`]+1;
                        }
                              //{'1':1.'2':3,...'31':0} 
                    }
                }

                Object.keys(count_emp).forEach(function(ele,idx){
                    // 각 날짜에 대해서 list에 push
                    var day = (ele).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');      //날짜
                    var week = ['일', '월', '화', '수', '목', '금', '토'];                 
                    var dayOfWeek = week[new Date(day).getDay()];                       //요일
                    var count_sum = (count_emp[ele]*8000).toLocaleString('ko-KR');
                    team_over_list.push({
                        "No":`${idx+1}`,
                        "날짜": day, 
                        "요일": dayOfWeek,
                        "팀이름":dept_name,
                        "급량비 산정횟수":count_emp[ele],
                        "총 급량비": count_sum 
                    });
                });


                $('.team-overtime-table').jsGrid({
                    sorting: true,
                    paging:true,
                    pageSize: 15,
                    pageButtonCount: 5,
                    data: team_over_list,
                    fields: [
                        { name: "No", type: "text",width:"35px"},
                        { name: "날짜", type: "text"},
                        { name: "요일", type: "text"},
                        { name: "팀이름", type: "text"},
                        { name: "급량비 산정횟수", type: "text"},
                        { name: "총 급량비", type: "text"}
                    ]
                });
                $('a:contains("1")').click();
                
            },
            error:function(result){
                alert('실패')
            }
        })
    })

    const login = async()=>{
        console.log('현재 페이지는 '+document.location.href+'입니다.');
        const { value: password } = await Swal.fire({
            title: '비밀번호를 입력하세요',
            icon:'warning',
            input: 'password',
            heightAuto:false,
            inputPlaceholder: '비밀번호를 입력하세요',
            inputAttributes: {
              maxlength: 15,
              autocapitalize: 'off',
              autocorrect: 'off'
            },
            inputValidator: (value) => {
                if (!value) {
                  return '비밀번호를 입력해주세요!'
                }
              }
          });
          
          if (password) {

            $.ajax({
                method:'POST',
                url:'/admin/login',
                data : {
                    password:password,
                },
                success:function(result){
                    console.log(result);
                    
                },
                error:function(result){
                    console.log(result);
                }
            })
          }
    
          
    }
    //관리자 로그인 버튼
    $('#admin-button').on('click',login);

    
});


