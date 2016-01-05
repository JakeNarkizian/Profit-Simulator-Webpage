/* FILENAME: script.js */


// FUNCTION: Create Pay Off
//     This function takes a string of mathematical operations and returns 
//     a function that performs the operation represented in the passed 
//     string. If the string is invalid "Undefined" is returned.  
var create_payoff_func = function(str){
    var payoff_func = function(U,S) { 
        return eval(str);         
    }; 
    return payoff_func;
}




// ------------------------
// --- OPTIONS FOR FLOT ---
// ------------------------
var options = {
    series: {
        lines: {
            show: true,
            lineWidth: 1.2,
            fill: true
        }
    },
    xaxis: {
        mode: "time",
        tickSize: [2, "second"],
        tickFormatter: function (v, axis) {
            var date = new Date(v);

            if (date.getSeconds() % 2 === 0) {
                var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

                return hours + ":" + minutes + ":" + seconds;
            } else {
                return "";
            }
        },
        axisLabel: "Time",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Helvetica',
        axisLabelPadding: 10
    },
    yaxis: {
        min: 0,
        max: 1,        
        tickSize: 2,
        
        axisLabel: "Profit",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Helvetica',
        axisLabelPadding: 6
    },
    grid: {                
        backgroundColor: "#FFFFFF",
        tickColor: "FFFFFF"
    }
};




// -----------------
// --- VARIABLES ---
// -----------------
user_num = .5;
cuml_profit = 0;
current_func = create_payoff_func("1 - Math.pow((U - S),2)");

var data = [];
var totalPts = 10;
var interval = 1000;
var now = new Date().getTime();




// ----------------------
// --- DOCUMENT READY ---
// ----------------------
$(document).ready( function(){
    
    // --- DOCUMENT SET UP ---
    graph_hidden = true;    
    $('#adv, #graph, #graph_info, #stch_val, #rst_btn').hide();
    
    
    
    // --- GRAPH FUNCTIONS / SET UP ---
    
    // FUNCTION: Get Data
    //     This function creates arrays of data. Data is composed of the 
    //     current time and profit. Each iteration of the array increases   
    //     the time amount by amount 'interval' and each profit is the 
    //     result of the current payoff function.
    var getData = function(){
        data.shift();
        while(data.length < totalPts){
            rand_num = Math.random();
            var profit = current_func(user_num,rand_num);
            $('#curr_num').html(Math.round(profit * 100)/100);
            if (graph_hidden === false){
                cuml_profit += profit;
            }
            $('#cuml_num').html(Math.round(cuml_profit * 100)/100);
            $('#stch_num').html(Math.round(rand_num * 100)/100);
            data.push([now+=interval,profit]);
        }
    }
    getData();
    dataset = [
        { data: data, color: "#88AAFF" }
    ];



    // FUNCTION: Update
    //      This function updates the graph by plotting a dataset and 
    //      calling itself. The self call occurs after 'interval' amount of
    //      time. The function runs only when the stop button has not been 
    //      pushed. 
    function update() {  
        if ($('#slc_btn').text() === 'Stop'){
            getData();
            $.plot($("#graph"), dataset, options)
            setTimeout(update, interval);
        }
    }
    update();
    
    
    
    // --- BUTTON BEHAVIOR ---
    $('.btn').hover(function(){
        $(this).fadeTo('fast',.7);
    }, function(){
        $(this).fadeTo('fast',1);
    });
    
    $('.btn').mouseup(function(){
        $(this).fadeTo(100,1);
        $(this).css('box-shadow','0 0 10px #CCCCCC');
    });
    
    $('.btn').mousedown(function(){
        $(this).fadeTo(100,.6);
        $(this).css('box-shadow','0 0 5px #BBBBBB');
    });
    


    // --- USER VALUE SLIDER ---
    $('#slider').change( function(){
        $('#slc_txt').text($('#slider').val());
        user_num = eval($('#slider').val());
    });



    // --- USER START / STOP BUTTON ---
    $('#slc_btn').click(function() {
    
        // > START PUSHED ---
        if ($(this).text() === 'Start'){
            $(this).text('Stop');
            if (graph_hidden){
                $('#graph,#graph_info, #rst_btn').show();
                graph_hidden = false;
                $('#slc_txt').text($('#slider').val());
                $('#cuml_num').text(cuml_profit);         
            }
            update();
            
        // > STOP PUSHED ---    
        }else{
            $(this).text('Start');      // Actual pausing done by checking 
                                        // html text
        }
    });



    // --- RESET BUTTON ---
    $('#rst_btn').click(function(){
        cuml_profit = 0;
        $('#cuml_num').text(cuml_profit);
    });



    // --- SHOW ADVANCED SETTINGS ---
    $('#adv_btn').click(function(){
        $('#adv').show();
        $('#adv_btn').remove();
    });
    
    
    
    // --- CHANGE PAYOFF FUNCTION ---
    $('#chng_fnc_btn').click( function(){
        var str = $('#chng_fnc_txt').val();
        if (str === ""){
            return;
        }
        var newFunc = create_payoff_func(str);
        try{ 
            newFunc(); 
        }catch(err){
        
            // > INVALID FUNCTION ENTERED ---
            $('#chng_fnc_instruct').fadeOut(10).fadeIn('fast');
            $('#chng_fnc_instruct').text("Your entry was invalid, ensure that you enter a valid JavaScript function");
            $('#chng_fnc_instruct').css('color', '#DD2222');
            $('#chng_fnc_txt_block').effect('shake',{times:3}, 500);  
           
            setTimeout(function(){$('#chng_fnc_instruct').html(
            "Enter a function using S and U for stochastic value and user value respectively");},3000);
            setTimeout(function(){$('#chng_fnc_instruct').css('color', '#000000');},3000);
            $('#chng_fnc_instruct').delay(2700).fadeOut(10).fadeIn('fast');
            return;
        }
        
        // > VALID FUNCTION ENTERED ---
        current_func = newFunc;
        $('#chng_fnc_instruct').fadeOut(10).fadeIn('fast');
        $('#chng_fnc_instruct').text("Function Changed");
        $('#chng_fnc_instruct').css('color', '#00AA00');
               
        setTimeout(function(){$('#chng_fnc_instruct').html(
        "Enter a function using S and U for stochastic value and user value respectively");},1500);
        setTimeout(function(){$('#chng_fnc_instruct').css('color', '#000000');},1500);
        $('#chng_fnc_instruct').delay(1200).fadeOut(10).fadeIn('fast'); 
    });
    
    
    
    // --- SHOW STOCHASTIC VALUE ---
    $('#show_btn').click(function(){
        
        // > SHOW PUSHED ---
        if ($(this).text() === 'Show Stochastic Value'){
            $('#stch_val').show();
            $(this).text('Hide Stochastic Value');
        
        // > HIDE PUSHED ---
        }else{
            $('#stch_val').hide();
            $(this).text('Show Stochastic Value');
        }
    });
});