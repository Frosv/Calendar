const currentTime = document.getElementById("currentTime"),
    currentMonth = document.getElementById("currentMonth"),
    dayUl = document.getElementById("dayUl"),
    presentMonth = document.getElementById("presentMonth"),
    pagePre = document.getElementById("pagePre"),
    pageNext = document.getElementById("pageNext"),
    presentDay = document.getElementById("presentDay"),
    dayEventcontent = document.getElementById("dayEventcontent"),
    dayEventAdd = document.getElementById("dayEventAdd");

function Calendar() {

    //随选中日期变动
    this.currentYears = new Date().getFullYear();
    this.currentMonths = new Date().getMonth() + 1;
    this.currentDates = new Date().getDate();
    this.currentYMD = this.currentYears + "" + (parseInt(this.currentMonths - 1) < 10 ? "0" + parseInt(this.currentMonths) : parseInt(this.currentMonths - 1)) + "" + (parseInt(this.currentDates) < 10 ? "0" + parseInt(this.currentDates) : parseInt(this.currentDates))
    
    //不变动时间
    this.presentYears = new Date().getFullYear();
    this.presentMonths = new Date().getMonth() + 1;
    //被选中日期
    this.selectDate = "";
    //当天task集合
    this.currentDayTasks = {};
    //有task的日期集合
    this.dayHaveTask = new Set();
    //todolist 集合
    this.todoLists = {};

    this.init();
    this.todolistRender();

    //模拟本日被点击
    document.getElementById("curToday").click();
}


Calendar.prototype = {
    init: function () {
        const _this = this;

        //时钟开始
        _this.timeToggle();
        setInterval(function () {
            _this.timeToggle();
        }, 1000)

        //生成时间下的日期
        _this.dayToggle();

        //将有任务的日期存进dayHaveTask数组
        for (var key in localStorage) {
            _this.dayHaveTask.add(key)
        }
        
        //渲染月份日历
        _this.monthRender();

        //将信息存入LocalStorage
        _this.insertLocalStorage();

        //日期被点击时加个边框，设置todo里的星期，从localstorage读取任务，然后渲染todolist否则显示无事件
        dayUl.addEventListener("click", function (e) {
            if (e.target && e.target.nodeName == "LI") {
                //遍历所有日期li，去掉select-day
                let _dayLi = dayUl.childNodes;
                for (let i = _dayLi.length - 1; i >= 0; i--) {
                    if (_dayLi[i].className.indexOf("select-day") != -1) {
                        _dayLi[i].classList.remove("select-day")
                        break;
                    }
                }
                //被点击的li添加select-day
                e.target.classList.add("select-day")
                _this.selectDate = document.getElementsByClassName("select-day")[0];
                const _date = e.target.dataset.date;
                //获取被点击的日期是星期几
                const _day = new Date(_date.slice(0, 4), _date.slice(4, 6) - 1, _date.slice(6, 8)).getDay();
                const _week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
                //显示周几和日期
                presentDay.innerHTML = _week[_day] + "  " + _date.toString().slice(6)
                //从localstorage中装载任务
                // debugger;
                if (localStorage[_date]) {
                    _this.currentDayTasks = JSON.parse("{" + localStorage[_date] + "}")
                    if (_this.dayHaveTask.has(_date)) {
                        //在有事件的日期列表中找到即渲染todolist
                        _this.todolistRender(_date)
                    } else {
                        //没有事件显示无事件
                        dayEventcontent.innerHTML = "&nbsp;&nbsp;&nbsp;无事件"
                    }
                } else {
                    //没有事件显示无事件
                    dayEventcontent.innerHTML = "&nbsp;&nbsp;&nbsp;无事件"
                }
            }
        })
        document.getElementById("curToday").click();

        //上一页
        pagePre.addEventListener("click", function () {
            _this.currentMonths == 1 ? (_this.currentMonths = 12, _this.currentYears--) : _this.currentMonths--;
            _this.monthRender();
        })

        //下一页
        pageNext.addEventListener("click", function () {
            _this.currentMonths == 12 ? (_this.currentMonths = 1, _this.currentYears++) : _this.currentMonths++;
            _this.monthRender();
        })

        //回到当前月
        currentMonth.addEventListener("click", function () {
            _this.currentMonths = _this.presentMonths;
            _this.currentYears = _this.presentYears;
            _this.monthRender();
            //模拟点击今日日期
            document.getElementById("curToday").click();
        })

        //todolist 操作
        dayEventcontent.addEventListener("click", function (e) {
            if (e.target && e.target.nodeName == "LI" && e.target.id) {
                let _selectDate = _this.selectDate.dataset.date;
                // console.log(_selectDate)
                e.target.classList.toggle("todo-finish")
                let _jsonLocal = JSON.parse("{" + localStorage[_selectDate] + "}");
                var _da = _jsonLocal[_selectDate][e.target.id.slice(4)].finish = !_jsonLocal[_selectDate][e.target.id.slice(4)].finish
                localStorage[_selectDate] = JSON.stringify(_jsonLocal).slice(1, JSON.stringify(_jsonLocal).length - 1)
            } else if (e.target && e.target.nodeName == "SPAN") {
                //添加todo
                if (e.target.className == "add-task-ok") {
                    let _id = e.target.dataset.id;
                    let _selectDate = document.getElementsByClassName("select-day")[0].dataset.date || _id;

                    const inputV = document.getElementById("task" + _id).value.trim();
                    if (inputV == "") {
                        document.getElementById("task" + _id).placeholder = "先输入，mdzz"
                    } else {
                        let _todo = "\"" + _id + "\":{\"text\":\"" + inputV + "\",\"finish\":false}"
                        // console.log(_todo)
                        if (localStorage[_selectDate]) {
                            localStorage[_selectDate] = localStorage[_selectDate].slice(0, 12) + _todo + "," + localStorage[_selectDate].slice(12)
                        } else {
                            localStorage[_selectDate] = "\"" + _selectDate + "\":{" + _todo + "}"
                        }
                        if (_this.dayHaveTask.has(_id.toString())) {
                            _this.todolistRender(_date)
                        }
                    // debugger;
                    //把输入框换成text，去掉勾,li加上id
                    let _par = e.target.parentNode;
                    _par.id = "task" + _id;
                    _par.innerHTML = inputV;
                    let _spandel = document.createElement("span");
                    _spandel.innerHTML = "x";
                    _spandel.dataset.id = _id;
                    _spandel.dataset.type = "del";
                    _spandel.className = "add-task-del";
                    _par.appendChild(_spandel);
                    _this.dayHaveTask.add(_selectDate);
                    // _this.monthRender();
                    // console.log(_this.selectDate);
                    //点击一下
                    _this.selectDate.classList.add("today-has-task")
                    }
                }
                if (e.target.className == "add-task-del") {
                    let _id = e.target.dataset.id;
                    let _selectDate = document.getElementsByClassName("select-day")[0].dataset.date || _id;
                    // console.log("remove:" + _id);
                    //移除li
                    document.getElementById("task" + _id).remove();
                    //从localstorage中删除
                    let _jsonLocal = JSON.parse("{" + localStorage[_selectDate] + "}");
                    // console.log("before:" + f)
                    //删除节点
                    delete _jsonLocal[_selectDate][_id];
                    //删除后事件数量
                    let t = 0;
                    for (let k in _jsonLocal[_selectDate]) {
                        t++
                    }
                    if (t == 0) {
                        //事件数量为0时清除localStorage中的item，去掉today-has-task，添加无事件标签
                        _this.dayHaveTask.delete(_selectDate)
                        localStorage.removeItem(_selectDate);
                        document.getElementsByClassName("select-day")[0].classList.remove("today-has-task");
                        dayEventcontent.innerHTML = "&nbsp;&nbsp;&nbsp;无事件";
                    } else {
                        localStorage[_selectDate] = JSON.stringify(_jsonLocal).slice(1, JSON.stringify(_jsonLocal).length - 1)
                    }
                }
            }
        })
        //添加一条todo
        dayEventAdd.addEventListener("click", function () {
            let _selectDate = document.getElementsByClassName("select-day")[0].dataset.date
            if (!_this.dayHaveTask.has(_selectDate.toString())) {
                dayEventcontent.innerHTML = "";
            }
            let _li = document.createElement("li"),
                _input = document.createElement("input"),
                _spanok = document.createElement("span"),
                _spandel = document.createElement("span");
            const _date = new Date(),
                _year = _date.getFullYear(),
                _month = _date.getMonth(),
                _dates = _date.getDate(),
                _hour = _date.getHours(),
                _minute = _date.getMinutes(),
                _seconds = _date.getMilliseconds(),
                taskId = _this.currentYMD + "" + (_hour < 10 ? "0" + _hour : _hour) + "" + (_minute < 10 ? "0" + _minute : _minute) + "" + (_seconds < 10 ? "0" + _seconds : _seconds)
            _input.type = "text";
            _input.placeholder = "请在此输入";
            _input.className = "task-text-input";
            _input.id = "task" + taskId;
            _li.appendChild(_input);
            _spanok.innerHTML = "✓";
            _spanok.dataset.id = taskId;
            _spanok.dataset.type = "ok";
            _spanok.className = "add-task-ok";
            _li.appendChild(_spanok);
            _spandel.innerHTML = "x";
            _spandel.dataset.id = taskId;
            _spandel.dataset.type = "del";
            _spandel.className = "add-task-del";
            _li.appendChild(_spandel);
            //插入到第一行
            dayEventcontent.insertBefore(_li, dayEventcontent.firstChild);
            document.getElementById("task" + taskId).focus();
        })
    },

    todolistRender: function (selectdate) {
        let _date = selectdate || this.currentYMD; //this.currentYMD;

        // debugger;
        //移除所有子节点
        const childs = dayEventcontent.childNodes;
        for (let i = childs.length - 1; i >= 0; i--) {
            dayEventcontent.removeChild(childs.item(i));
        }

        const cdt = this.currentDayTasks;
        // console.log(cdt)
        for (let key in cdt[_date]) {
            let _li = document.createElement("li");
            let _span1 = document.createElement("span");
            _li.id = "task" + key;
            _li.innerHTML = cdt[_date][key].text;
            if (cdt[_date][key].finish) {
                _li.className = "todo-finish";
            }
            _span1.innerHTML = "x";
            _span1.dataset.id = key;
            _span1.dataset.type = "del";
            _span1.className = "add-task-del";
            _li.appendChild(_span1)

            dayEventcontent.appendChild(_li)

        }
    },

    monthRender: function () {
        dayUl.innerHTML = ""
        let _days = []
        presentMonth.innerHTML = this.currentYears + " 年 " + this.currentMonths + " 月"
        this.monthFirstDay = this.getfirstDayWeek(this.currentYears, this.currentMonths - 1);
        this.monthDays = this.getMonthDays(this.currentYears, this.currentMonths);
        let cFrag = document.createDocumentFragment();
        this.monthFirstDay == 0 ? this.monthFirstDay = 7 : ""
        if (this.monthFirstDay > 1) {
            const lastMonthDays = this.getMonthDays(this.currentYears, this.currentMonths - 1);
            //填充上月的尾巴
            for (let i = this.monthFirstDay - 1; i > 0; i--) {
                _days.unshift(lastMonthDays - i + 1)
                let li = document.createElement("li");
                li.innerHTML = lastMonthDays - i + 1;
                li.dataset.date = this.currentYears + "" + (parseInt(this.currentMonths - 1) < 10 ? "0" + parseInt(this.currentMonths - 1) : parseInt(this.currentMonths - 1)) + "" + (lastMonthDays - i + 1)
                //本日有事件，加个class标记
                if (this.dayHaveTask.has(li.dataset.date)) {
                    li.classList.add("today-has-task")
                }
                cFrag.appendChild(li)
            }
        }
        for (let i = 1; i <= this.monthDays; i++) {
            _days.push(i)
            let li = document.createElement("li");
            li.innerHTML = i;
            li.dataset.date = this.currentYears + "" + (parseInt(this.currentMonths) < 10 ? "0" + parseInt(this.currentMonths) : parseInt(this.currentMonths)) + "" + (i < 10 ? "0" + i : i);
            li.className = "cur-m";
            if (i == this.currentDates && this.currentMonths == this.presentMonths && this.currentYears == this.presentYears) {
                li.classList.add("cur-today")
                li.classList.add("select-day")
                li.id = "curToday"
            }
            //本日有事件，加个class标记
            if (this.dayHaveTask.has(li.dataset.date)) {
                li.classList.add("today-has-task")
            }
            cFrag.appendChild(li);
        }
        if (this.monthFirstDay + this.monthDays < 42) {
            //填充本月的尾巴
            let m = 42 - this.monthFirstDay - this.monthDays;
            for (let i = 1; i < m + 2; i++) {
                _days.push(i)
                let li = document.createElement("li");
                li.innerHTML = i;
                li.dataset.date = this.currentYears + "" + (parseInt(this.currentMonths + 1) < 10 ? "0" + parseInt(this.currentMonths + 1) : parseInt(this.currentMonths + 1)) + "" + (i < 10 ? "0" + i : i);
                //本日有事件，加个class标记
                if (this.dayHaveTask.has(li.dataset.date)) {
                    li.classList.add("today-has-task")
                }
                cFrag.appendChild(li)
            }
        }
        dayUl.appendChild(cFrag)
    },

    //添加进LocalStorage
    insertLocalStorage: function () {
        if (window.localStorage) {
            // localStorage.clear();
            for (let k in this.todoLists) {
                // console.log(k, this.currentYMD)
                if (localStorage[k]) {
                    if (k == this.currentYMD) {
                        this.currentDayTasks = JSON.parse("{" + localStorage[k] + "}")
                        // console.log(this.currentDayTasks)
                        break
                    }
                } else {
                    localStorage[k] = "\"" + k + "\":{"
                    for (let _k in this.todoLists[k]) {
                        localStorage[k] += "\"" + _k + "\":{\"text\":\"" + this.todoLists[k][_k].text + "\",\"finish\":" + this.todoLists[k][_k].finish + "},";
                    }
                    localStorage[k] += "}"
                    localStorage[k] = localStorage[k].replace("},}", "}}");
                }
            }
        }
    },

    //今天的日期
    dayToggle: function () {
        let cu = new Date();
        currentMonth.innerHTML = cu.getFullYear() + "年" + parseInt(cu.getMonth() + 1) + "月" + cu.getDate() + "日";
    },

    //现在的时间
    timeToggle: function () {
        let cuTime = new Date(),
            cuHours = cuTime.getHours() > 9 ? cuTime.getHours() : "0" + cuTime.getHours(),
            cuMinutes = cuTime.getMinutes() > 9 ? cuTime.getMinutes() : "0" + cuTime.getMinutes(),
            cuSeconds = cuTime.getSeconds() > 9 ? cuTime.getSeconds() : "0" + cuTime.getSeconds();
        currentTime.innerHTML = cuHours + ":" + cuMinutes + ":" + cuSeconds;
        if (cuHours == 0 && cuMinutes == 0 && cuSeconds == 1) {
            this.dayToggle();
        }
    },

    //获取月天数
    getMonthDays: (year, month) => {
        const m = new Date(year, month);
        m.setDate(0);
        return m.getDate();
    },

    //获取当月第一天星期
    getfirstDayWeek: (year, month) => {
        const m = new Date(year, month, 1);
        return m.getDay();
    }
}
window.onload = () => {
    var ca = new Calendar();
}