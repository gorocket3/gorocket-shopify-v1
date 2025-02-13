/*
*
* 상단의 검색영역 정의
*
* */
var App = function (id, options) {
    this.options = options;
    this.lifeCycle = {};
};

/**
 * 토큰 만료시 ajax 요청하는 경우 로그인 페이지로 이동
 */
(function (open) {
    XMLHttpRequest.prototype.open = function () {
        this.addEventListener("readystatechange", function () {
            const { responseURL } = this;
            let regExp = /.+(?=\/login)/i;
            let match_arr = responseURL.match(regExp);
            if (match_arr) {
                location.href = responseURL;
            }
        }, false);
        open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);

App.prototype.ResizeGrid = function (grid_height_margin, height, areaId = '') {
    this.options.grid_resize = true;
    if (grid_height_margin !== undefined) {
        this.options.grid_height_margin = grid_height_margin;
    } else {
        this.options.grid_height_margin = 140;
        //this.options.grid_height_margin = 0;
    }

    //__grid_resize = true;
    //var grid_height = $(window).height() - $('#search-area').height() - height;
    //grid.css('height',$(window).height() - $('#search-area').height() - height);
    var minus_height = this.options.grid_height_margin;
    //console.log(minus_height);

    if (areaId === '') areaId = "search-area";

    if ($('#' + areaId).length) {
        minus_height += $('#' + areaId).height();
    }

    if ($('div.page-content').length) {

        //console.log(minus_height);
        minus_height += parseInt($('div.page-content').css("padding-top"));
        //console.log(minus_height);
        minus_height += parseInt($('div.page-content').css("padding-bottom"));

        //console.log($('div.page-content').css("padding-top"));
        //console.log($('div.page-content').css("padding-bottom"));
        //console.log(minus_height);
    }

    if (height === undefined) {
        $(this.options.gridId).css({ 'height': 'calc(100vh - ' + minus_height + 'px)' });
    } else {
        $(this.options.gridId).css({ 'height': height });
    }
};

App.prototype.BindSearchEnter = function (btn = '#search_sbtn') {
    $('.search-enter').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === 13) {
            $(btn).click();
            event.preventDefault();
            return false;
        }
    });
};

$(document).ready(function () {
    var now = new Date();
    var year = now.getFullYear();
    if (!$(".docs-date").hasClass("month")) {
        $('.docs-datepicker .docs-date').datepicker({
            days: [ "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일" ],
            daysShort: [ "일", "월", "화", "수", "목", "금", "토" ],
            daysMin: [ "일", "월", "화", "수", "목", "금", "토" ],
            months: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ],
            monthsShort: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ],
            date: 'year',
            format: 'yyyy-mm-dd',
            autoHide: true,
            language: "kr"
        });
    } else {
        $('.docs-datepicker .docs-date').datepicker({
            months: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ],
            monthsShort: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ],
            date: 'month',
            format: 'yyyy-mm',
            autoHide: true,
            language: "kr"
        });
    }
    $(".docs-datepicker-trigger").on("click", function (e) {
        e.stopPropagation();
        $(this).parents(".docs-datepicker").find(".docs-date").trigger("focus");
    });

    $("#search-btn-collapse").addClass("search_mode_wrap");
    $(".search_mode_wrap").html(`
        <button type="button" class="btn btn-sm btn-outline-primary pr-1 waves-light waves-effect dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
            <i id="" class="search-btn-label fa fa-square fs-12"></i> <i class="bx bx-chevron-down fs-12"></i>
        </button>
        <div class="dropdown-menu" style="min-width:0">
            <a id="search-btn-minus" class="dropdown-item" data-search-type="minus" href="#"><i class="fa fa-minus-square"></i></a>
            <a id="search-btn" class="dropdown-item" href="#" data-search-type="default"><i class="fa fa-square"></i></a>
            <a id="search-btn-plus" class="dropdown-item" href="#" data-search-type="plus"><i class="fa fa-plus-square"></i></a>
        </div>
    `);

    $(".search_mode_wrap .dropdown-menu a").on("click", function (e) {
        e.preventDefault();
        if ($(this).data("search-type") === "plus") {
            $(".search-btn-label").attr("class", "search-btn-label fa fs-12 fa-plus-square");
            $("#search-area .card-body").removeClass("d-none");
            $(".search-area-ext").removeClass("d-none");
        } else if ($(this).data("search-type") === "minus") {
            $(".search-btn-label").attr("class", "search-btn-label fa fs-12 fa-minus-square");
            $("#search-area .card-body").addClass("d-none");
            $(".search-area-ext").addClass("d-none");
        } else {
            $(".search-btn-label").attr("class", "search-btn-label fa fs-12 fa-square");
            $("#search-area .card-body").removeClass("d-none");
            $(".search-area-ext").addClass("d-none");
        }
        if (pApp.options.grid_resize == true) {
            pApp.ResizeGrid(pApp.options?.height || 275);
        }
    });


    /*$( "#search-btn-plus" ).on("click", function(e) {
        e.preventDefault();
        $( "#search-area .card-body" ).removeClass( "d-none");
        $( ".search-area-ext" ).removeClass( "d-none");
        $( "#search-btn-label" ).removeClass( "fa-square");
        $( "#search-btn-label" ).removeClass( "fa-minus-square");
        $( "#search-btn-label" ).addClass( "fa-plus-square");
        if(pApp.options.grid_resize == true){
            pApp.ResizeGrid();
        }
    });

    $( "#search-btn-minus" ).on("click", function(e) {
        e.preventDefault();
        $( "#search-area .card-body" ).addClass( "d-none");
        $( ".search-area-ext" ).addClass( "d-none");
        $( "#search-btn-label" ).removeClass( "fa-square");
        $( "#search-btn-label" ).removeClass( "fa-plus-square");
        $( "#search-btn-label" ).addClass( "fa-minus-square");
        if(pApp.options.grid_resize == true){
            pApp.ResizeGrid();
        }
    });

    $( "#search-btn" ).on("click", function(e) {
        e.preventDefault();
        $( "#search-area .card-body" ).removeClass( "d-none");
        $( ".search-area-ext" ).addClass( "d-none");
        $( "#search-btn-label" ).removeClass( "fa-minus-square");
        $( "#search-btn-label" ).removeClass( "fa-plus-square");
        $( "#search-btn-label" ).addClass( "fa-square");
        if(pApp.options.grid_resize == true){
            pApp.ResizeGrid();
        }
    });*/

    // ESC키로 팝업창 닫기
    window.onkeyup = function (e) {
        if (e.key === 'Escape') {
            if ($(".modal.show").length > 0) {
                $(".modal.show").modal('hide');
            } else if ($("#gnb").length > 0 && !$("#gnb").hasClass('d-none')) {
                $("#gnb").addClass('d-none');
                $(".top_link_btn .menu").removeClass('act');
            } else if (opener !== null) {
                window.close();
            }
        }
    }
});

