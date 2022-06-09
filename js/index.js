document.write("<script src='../js/index_lib.js'></script>");
// 사원 index 페이지
$(document).ready(function(){
    // MutationObserver : jsgrid table 페이지 이동시에도 감지해야 함 
    let target = document.querySelector('.overtime-table');
    let observer = new MutationObserver((mutations)=>{
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


    //출퇴근기록 조회 시 날짜 선택기
    $.datepicker.setDefaults($.datepicker.regional['ko']);
    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd'
        ,showOtherMonths : true
        ,changeYear:true
        ,changeMonth:true
        ,minDate:new Date('2022-01-01'),
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
        $("#datepicker1, #datepicker2").datepicker();
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

    // monthpicker - 초과근무-급량비 조회 시 월 선택기
    $('#monthpicker1').monthpicker(options);
    $('#monthpicker2').monthpicker(options);
    //monthpicker - 미래 월은 비활성화시키기
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

    // 출퇴근기록 TAB - 조회하기 버튼 누르면 table 표출
    $('#check-inout').on('click',function(e){
        // 버튼 누를 때마다 테이블 초기화
        $('.inout-table').html('');
        var start_day = $('#datepicker1').val().replace(/\-/g,'');;
        var end_day = $('#datepicker2').val().replace(/\-/g,'');;
        // 기간 설정 잘못한 경우
        if(!validateInterval(start_day,end_day))
        {
            Swal.fire({
                text:"기간을 다시 설정해주세요.",
                icon:'warning'
            }).then(()=>{
                $('#datepicker1').val('');
                $('#datepicker2').val('');
            });   
        }else{
            $('#check-inout').prop('disabled', true);
            var emp_id = $($('.mem-num')[0]).text();    
            var check_list = {'start_day':start_day,'end_day':end_day,'emp_id':emp_id}
            // 사번,날짜정보 보냄
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
                        var dayOfWeek = week[new Date(day).getDay()];           //day에 따라 요일 얻기

                        // list : jsgrid에 data로 넣어줄 리스트. 서버에서 보내주는 result를 push 함
                        list.push({
                            "No":`${i+1}`,
                            "사번":result[i]['EMP_ID'],
                            "이름": result[i].NAME,
                            "부서": result[i].ORG_NM,
                            "날짜": day, 
                            "요일": dayOfWeek,
                            "근무유형":workTypeDict[`${result[i].WORK_TYPE}`],
                            "출입시각":result[i].INOUT,
                            "확정시각":result[i].FIX1,
                            "계획시간":result[i].PLAN1,
                            "비고":result[i].ERROR_INFO,
                        })
                    }
                
                    //jsGrid : table 만들어주는 library. sorting : 각 열 제목 누르면 정렬함/ paging : 페이징 기능
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
                            { name: "부서", type: "text"},
                            { name: "날짜", type: "text"},
                            { name: "요일", type: "text",width :"35px"},
                            { name:"근무유형", type:"text"},
                            { name:"출입시각", type:"text"},
                            { name:"확정시각", type:"text"},
                            { name:"계획시간", type:"text"},
                            { name:"비고", type:"text"}
            
                        ]
                    })
                    //$('a:contains("1")').click(): 조회하기를 다시 눌렀을 때, 1페이지로 refresh 되도록 함.
                    $('a:contains("1")').click();
                    // ajax 완료시, 버튼 비활성화 되었던 것을 풀어줌.
                    
                   
                },
                error:function(result){
                    var params = "msg="+result.responseText
                    location.href=`/users/error?${params}`
                }
            }).then(()=>{
                // 날짜 입력하는 곳에 남아있는 text 삭제함.
                $('#check-inout').prop('disabled', false);
                $('#datepicker1').val(dayFormatTranslate(start_day));
                $('#datepicker2').val(dayFormatTranslate(end_day));
            })
        }
    });

    // 초과근무 및 급량비 산정 확인 버튼
    $('#check-overtime').on('click',function(e){

        // 버튼 누를 때마다 테이블 초기화
        $('.overtime-table').html('');

        var emp_id = $($('.mem-num')[0]).text();
        var date = $('#monthpicker1').val();
        if(date==''){
            // 기간 잘못 설정한 경우
            Swal.fire({
                text:"기간을 다시 설정해주세요.",
                icon:'warning'
            }).then(()=>{
                $('#monthpicker1').val('');
            });
        }
        else{
            $('#check-overtime').prop('disabled', true);
            const year = date.split('-')[0];
            const month = date.split('-')[1];
            var [start_day,end_day] = monthPicktoString(date);
            $.ajax({
                // 서버로 사번,시작날짜,끝날짜 보냄 
                method:'POST',
                url:'/users/overtime',
                data:{'emp_id':emp_id,'start_day':start_day,'end_day':end_day},
                success:function(result){
                    // result로 오는 정보 : 각 월에 해당하는 초과근무 및 급량비 산정 기록 + endOFWeek : 그 달의 총 주 수 
                    $('.summary-table').css('display','inline-table');
                    // table생성 (end_of_week에 따라서)
                    $('.week-tr').html('');
                    $('.week-overtime').html('');
                    $('.week-cal').html('');
                    // 주 수에 따라 table layout 생성
                    for(var i=0;i<result.endOfWeek;i++)
                    {
                        $('.week-tr').append(`<th scope="col" class="${i+1}-week week-col">${i+1}주차</th>`)
                        $('.week-overtime').append(`<th scope="col" class="${i+1}-overtime week-col"></th>`)
                        $('.week-cal').append(`<th scope="col" class="${i+1}-cal week-col"></th>`)
                    }
                    $('.week-tr').append(`<th scope="col" class="week-col">합산</th>`)
                    $('.week-tr').append(`<th scope="col" class="week-col">초과근무 기준시간</th>`)
                    $('.week-overtime').append(`<th scope="col" class="over-sum week-col" ></th>`)
                    $('.week-overtime').append(`<th rowspan="2" scope="col" class="over-std week-col"></th>`)
                    $('.week-cal').append(`<th scope="col" class="cal-sum week-col"></th>`)
                    $('.week-tr>.1-week').before(`<th scope="col" class="date week-col"></th>`)
                    $('.week-tr>.date').html(`${year}년 ${month}월`);
                    $('.week-overtime>.1-overtime').before(`<th scope="row" class="week-col" >초과근무</th>`)
                    $('.week-cal>.1-cal').before(`<th scope="row" class="week-col">급량비</th>`)
    
                    // 초과근무 및 급량비 계산결과 있는 경우만 실행
                    if(result.empInfo.length!=0){
                        var overtime = {1:[],2:[],3:[],4:[],5:[],6:[]};
                        var cal_meal = {1:0,2:0,3:0,4:0,5:0,6:0};
                        var now_week = result.empInfo[0].WEEK;  
                        var over_std_time = result.empInfo[0].over_std_time;
                        $('.over-std').html(`${over_std_time} 시간`);                   //각 사원의 초과근무기준시간
                        for(var m=0;m<result.empInfo.length;m++)
                        {
                            // WEEK에 따라서 나누기
                            // (급량비==true)갯수 * 8000
                            if (result.empInfo[m].WEEK==now_week){
                                // 이번 주에 해당하는 초과근무시간 정보 push 하기 이 때, 급량비 == TRUE 이면 cal_meal +1
                                overtime[`${now_week}`].push(result.empInfo[m].CAL_OVERTIME);
                                if(result.empInfo[m].CAL_MEAL=="TRUE"){
                                    cal_meal[`${now_week}`]=cal_meal[`${now_week}`]+1;
                                }
                            }
                            else{
                                // 다음주로 넘어온 경우, now_week 새로 할당
                                now_week = result.empInfo[m].WEEK;
                                overtime[`${now_week}`].push(result.empInfo[m].CAL_OVERTIME);
                                if(result.empInfo[m].CAL_MEAL=="TRUE"){
                                    // 트루이면 cal_meal에 넣기
                                    cal_meal[`${now_week}`]=cal_meal[`${now_week}`]+1;
                                }
                            }
                        }
                        const overTimeTotal = addOverTimeTotal(overtime);       //각 주차에 대한 초과근무시간 정보 분으로 나타냄.
                        var over_sum = 0;    
                        Object.values(overTimeTotal).forEach(function(ele,idx){
                            over_sum=over_sum+parseInt(ele);
                            ele_overtime =  hhmmToString(ele);                  //초과근무 시간 정보를 hh시간 mm분 으로 변환.
                            $(`.${idx+1}-overtime`).html(ele_overtime);         //각 주차에 대한 초과근무 시간 삽입
                        });

                        //초과근무 합산
                        over_sum = hhmmToString(over_sum);
                        $('.over-sum').html(over_sum);
        
                        //급량비 합산
                        var cal_sum=0;
                        Object.values(cal_meal).forEach(function(ele,idx){
                            //{'1':0,'2':3,...}
                            cal_count = ele*8000;
                            cal_sum+=cal_count;

                            const cal_string = (cal_count).toLocaleString('ko-KR');     //원 단위 (,) 나타내기 위함
                            $(`.week-cal>.${idx+1}-cal`).html(cal_string+'원');
                        });
        
                        $('.week-cal>.cal-sum').html(cal_sum.toLocaleString('ko-KR')+'원');
                        $('#check-overtime').prop('disabled', false);
                        
                        // detail table 표출
                        // if "팀장 ", "초과근무시간" => "출퇴근기록시간"
                        
                        var over_list = [];
                        let is_over='';
                        for(var i=0;i<result.empInfo.length;i++)
                        {
                                day = (result.empInfo[i].YMD).replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                                var week = ['일', '월', '화', '수', '목', '금', '토'];
                                var dayOfWeek = week[new Date(day).getDay()];
                                var cutOff = result.empInfo[i].CUTOFF;
                                var etc = '';
                                var except = result.empInfo[i].EXCEPT;
                                var time = result.empInfo[i].CAL_OVERTIME;
                               
                                if (cutOff == true){
                                    etc = "(초과근무 일부 반영)"
                                }
                                over_list.push({
                                    "No":`${i+1}`,
                                    "사번":result.empInfo[i]['EMP_ID'],
                                    "이름": result.empInfo[i].NAME,
                                    "날짜": day, 
                                    "요일": dayOfWeek,
                                    "주차": `${result.empInfo[i].WEEK}주차`,
                                    "급량비유무": (result.empInfo[i].CAL_MEAL=="TRUE") ? "O" : "X"
                                });
                                
                                if(except){
                                    is_over = '출퇴근기록'
                                    time = result.empInfo[i].INOUT;
                                    time=time.split('~').map(str=>{
                                        if(str==''){
                                            return '';
                                        }
                                        return str.substring(0,2)+':'+str.substring(2)
                                      }).join('~')
                                      over_list[i][is_over] = time;
                                }
                                else{
                                    is_over = '초과근무시간'
                                    over_list[i][is_over] = `${hhmmToString2(time)} ${etc}`;
                                }
                                
                                
                        }
        
                        $('.overtime-table').jsGrid({
                            height:"70%",
                            sorting: true,
                            autoload:true,
                            data: over_list,
                            fields: [
                                { name: "No", type: "number",width:"35px"},
                                { name: "사번", type: "text"},
                                { name: "이름", type: "text"},
                                { name: "날짜", type: "text"},
                                { name: "요일", type: "text", width:"50px"},
                                { name: "주차", type: "text", width:"50px"},
                                { name: `${is_over}`, type: "text",width:"280px"},
                                { name: "급량비유무", type: "text"}
                            ]
                        });
                        
                        $('a:contains("1")').click();
                    }
                    
                },
                error:function(result){
                    var params = "msg="+result.responseText
                    location.href=`/users/error?${params}`
                }
            }).then(()=>{
                $('#check-overtime').prop('disabled', false);
            })
            
        }
        
    })

    //팀별 급량비 조회하기 버튼
    $('#check-team-overtime').on('click',function(e){
        
        $('.team-overtime-table').html('');
        var dept_name = $($('.mem-dept')[0]).text();
        var date = $('#monthpicker2').val();
        if(date==''){
            Swal.fire({
                text:"기간을 다시 설정해주세요.",
                icon:'warning'
            }).then(()=>{
                $('#monthpicker2').val('');
            });
            
        }else{
            $('#check-team-overtime').prop('disabled', true);
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
                    // console.log(result);
                    $('.team-summary-table').css('display','inline-table');
                    $('.team-week-tr').html('');
                    $('.team-week-cal').html('');
                    for(var i=0;i<result.endOfWeek;i++)
                    {
                        $('.team-week-tr').append(`<th scope="col" class="${i+1}-week week-col">${i+1}주차</th>`)
                        $('.team-week-cal').append(`<th scope="col" class="${i+1}-cal week-col"></th>`)
                    }
                    $('.team-week-tr').append(`<th scope="col" class="week-col">합산</th>`) 
                    $('.team-week-cal').append(`<th scope="col" class="cal-sum week-col"></th>`)
                    $('.team-week-tr>.1-week').before(`<th scope="col" class="date week-col"></th>`)
                    $('.team-week-tr>.date').html(`${year}년 ${month}월`);
                    $('.team-week-cal>.1-cal').before(`<th scope="row" class="week-col">급량비</th>`)
                    
                    if(result.empInfo.length!=0){
                        var team_cal_meal = {1:0,2:0,3:0,4:0,5:0,6:0};
                        var now_week = result.empInfo[0].WEEK;
        
                        for(var m=0;m<result.empInfo.length;m++)
                        {
                            if(result.empInfo[m].WEEK==now_week){
                                if(result.empInfo[m].CAL_MEAL=="TRUE"){
                                    // 급량비 == TRUE 이면 급량비 횟수 증가
                                    team_cal_meal[`${now_week}`]=team_cal_meal[`${now_week}`]+1;
                                }
                            }
                            else{
                                now_week = result.empInfo[m].WEEK;
                                if(result.empInfo[m].CAL_MEAL=="TRUE"){
                                    // 급량비 == TRUE 이면 급량비 횟수 증가
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
                        
                        var count_emp = {};                         //각 날짜에 해당하는 calmeal=true인 총 인원수
                        var end_d = parseInt(end_day.substring(6,8));
                    
                        //조회 시작 날짜부터 끝 날짜까지를 key로 하여 object 초기화
                        //ex. count_emp={'20220103':0,'20210304':0,...}
                        for(var i=0;i<end_d;i++)
                        {  
                            count_emp[parseInt(start_day)+i] = 0;
                        }
        
                        //각 사원에 대해서 각 날짜에 대한 급량비 횟수 계산
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
                            }
                        }
        
                        //team_over_list : jsGrid에 넣어줄 데이터 리스트
                        var team_over_list = [];
                        Object.keys(count_emp).forEach(function(ele,idx){
                            
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
                                { name: "No", type: "number",width:"35px"},
                                { name: "날짜", type: "text"},
                                { name: "요일", type: "text"},
                                { name: "팀이름", type: "text"},
                                { name: "급량비 산정횟수", type: "text"},
                                { name: "총 급량비", type: "text"}
                            ]
                        });
                        
                        $('a:contains("1")').click();
                    }
                    
                },
                error:function(result){
                    var params = "msg="+result.responseText
                    location.href=`/users/error?${params}`
                }
            }).then(()=>{
                $('#check-team-overtime').prop('disabled', false);
            })

        }
        
    })

    //관리자 로그인 버튼 누를시 실행되는 함수
    const login = async()=>{
        // console.log('현재 페이지는 '+document.location.href+'입니다.');
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
                    // console.log(result);
                    location.href='/admin/main'
                },
                error:function(result){
                    var params = "msg="+result.responseText
                    location.href=`/admin/error?${params}`
                }
            })
          }
    }

    //관리자 로그인 버튼
    $('#admin-button').on('click',login);    
});


