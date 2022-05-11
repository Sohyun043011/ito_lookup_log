document.write("<script src='../js/index_lib.js'></script>");
$(document).ready(function(){

    //부서 list 출력

    // 로그아웃 버튼 
    $('#logout-button').click(function(){
        alert('로그아웃');
        $.ajax({
            type:"GET",
            url:"/admin/logout",
            success:function(data){
                console.log("success");
                location.replace('/users/main');
            }
        })
    })

    //조회버튼
    $('#check-search').on('click',function(){
        alert("조회하기");
        var emp_name = $('#empName').val();
        var emp_id = $('#empID').val();
        var org_nm = $('#select-dept').val();
        console.log(org_nm);
        var type = 'inout';
        var start_day = $('#admin_datepicker1').val().replace(/\-/g,'');;
        var end_day = $('#admin_datepicker2').val().replace(/\-/g,'');;
        if(!validateInterval(start_day,end_day))
        {
            alert('기간을 다시 설정해주세요.');
            $('#admin_datepicker1').val('');
            $('#admin_datepicker2').val('');
            
        }else{
            $('#check-search').prop('disabled', true);
            var info = {'emp_name':emp_name,'emp_id':emp_id,'org_nm':org_nm,'start_day':start_day,'end_day':end_day};
            // ajax로 날짜 두개, 사번 드림
            $.ajax({
                type:"GET",
                url:`/admin/ehr/${type}`,
                data:info,
                success:function(result){
                    console.log("success");
                    console.log(result);
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
                    })
                    $('a:contains("1")').click();
                    // res로 받은 정보들을 list에 넣음 
                    $('#check-search').prop('disabled', false);
                }
            });

            
        }
    });


    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd'
        ,showOtherMonths : true
        ,changeYear:true
        ,changeMonth:true
        ,minDate:"-6M",
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
    var startYear = currentYear-5;
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

});

