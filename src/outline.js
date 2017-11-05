var Outline = function(opts) {
    var titPos = [],
        posTimeout,
        curTit,

        /**
         * 页面通用utils
         */
        utils = {
            _id: function(id) {
                return document.getElementById(id);
            },
            _hasClass: function(element, name) {
                var re = new RegExp("(^| )" + name + "( |$)");
                return re.test(element.className);
            },
            _addClass: function(element, name) {
                if (!this._hasClass(element, name)) {
                    element.className += " " + name;
                }
            },
            _removeClass: function(element, name) {
                if (this._hasClass(element, name)) {
                    var reg = new RegExp("(\\s|^)" + name + "(\\s|$)");
                    element.className = element.className.replace(reg, "");
                }
            },
            _class: function(searchClass, node, tag) {
                var classElements = [],
                    els, elsLen;
                if (node == null) node = document.body;
                if (tag == null) tag = "*";
                if (node.getElementsByClassName) {
                    return node.getElementsByClassName(searchClass);
                }
                els = node.getElementsByTagName(tag);
                elsLen = els.length;
                for (var i = 0, j = 0; i < elsLen; i++) {
                    if (this._hasClass(els[i], searchClass)) {
                        classElements[j] = els[i];
                        j++;
                    }
                }
                return classElements;
            },
            _extends: function(destination, source) {
                for (property in source) {
                    destination[property] = source[property];
                }
                return destination;
            },
            _addEvent: function(ele, type, func) {
                if (ele.addEventListener) {
                    ele.addEventListener(type, func, false);
                } else if (ele.attachEvent) {
                    ele.attachEvent("on" + type, func);
                } else {
                    ele["on" + type] = func;
                }
            },
            _getTarget: function(event) {
                return event.target || event.srcElement;
            },
            _vendor: function() {
                var ua = navigator.userAgent,
                    tem,
                    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                if (/trident/i.test(M[1])) {
                    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                    return "IE " + (tem[1] || "");
                }
                if (M[1] === "Chrome") {
                    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                    if (tem != null) return tem.slice(1).join(" ").replace("OPR", "Opera");
                }
                M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
                if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
                return M.join(" ");
            },
            _contains: function(parent, child, itself) {
                if (itself && parent === child) {
                    return true;
                }
                if (parent.contains) {
                    if (parent.nodeType === 9) return true;
                    return parent.contains(child);
                } else if (parent.compareDocumentPosition) {
                    return !!(parent.compareDocumentPosition(child) & 16);
                }
                while ((child = child.parentNode)) {
                    if (parent === child) return true;
                }
                return false;
            },
            _delegate: function(evType, parent, eleClassName, trigger) {
                utils._addEvent(parent, evType, function(e) {
                    var event = e || window.event,
                        target = utils._getTarget(event),
                        eleList = utils._class(eleClassName, parent);

                    for (var i = 0, len = eleList.length; i < len; i++) {
                        if (utils._contains(eleList[i], target)) {
                            trigger.call(eleList[i], event);
                            break;
                        }
                    }
                });
            }
        },

        /**
         * 目录参数
         * 各项参数说明：
         * outlId -------- 大纲外层容器id，默认"myOutline"
         * outlClass ----- 大纲外层容器class，默认"my-outline"
         * outlWidth ----- 大纲外层容器宽度，默认250px
         * ifFold ---------- 是否默认折叠菜单（true为折叠），默认false
         * wrapClass ----- 包裹原页面内容容器class，默认"my-wrap"
         * ifSmooth -------- 是否平滑跳转，默认false
         * duration ------ (若平滑跳转)跳转时长，默认60
         * ifList -------- 是否包含原文中的列表项(li), 默认false
         */
        conf = utils._extends({
            outlId: "myOutline",
            outlClass: "my-outline",
            outlWidth: 250,
            ifFold: false,
            wrapClass: "my-wrap",
            ifSmooth: false,
            duration: 60,
            ifList: false
        }, opts),

        /**
         * 控件工具函数
         */
        ol = {
            // 获取页面所有标题
            getAllTit: function() {
                var c = conf,
                    b = utils._class(conf.wrapClass)[0],
                    allNodes = b.getElementsByTagName("*"),
                    allTit = [],
                    n;
                for (var i = 0, len = allNodes.length; i < len; i++) {
                    n = allNodes[i].tagName.toUpperCase();
                    if (c.ifList && n == "LI") {
                        allTit.push(allNodes[i]);
                    } else if (n == "H1" || n == "H2" || n == "H3" || n == "H4" || n == "H5" || n == "H6") {
                        allTit.push(allNodes[i]);
                    }
                }
                return allTit;
            },
            // 最高一级标题level
            getTopLevel: function(titles) {
                var MaxLv = titles[0].level;
                return MaxLv;
            },
            // 获取标题文字
            getTitText: function(ele) {
                return ele.innerHTML.replace(/<[^>]+>/g, "");
            },
            // 获取标题位置
            getPos: function(ele) {
                var parentNode = ele.offsetParent,
                    pos = ele.offsetTop;
                while (parentNode) {
                    pos += parentNode.offsetTop;
                    parentNode = parentNode.offsetParent;
                }
                return pos;
            },
            // 创建目录
            createOutline: function(titles) {
                var c = conf,
                    b = document.body,
                    outl,
                    topLv,
                    sId = 0,
                    t = titles,
                    wrapStr;
                // 遍历标题获取需要信息
                for (var i = 0, len = t.length; i < len; i++) {
                    if (c.ifList && t[i].tagName.toUpperCase() == "LI") {
                        t[i].level = 7;
                    } else {
                        t[i].level = parseInt(t[i].tagName.substring(1), 10);
                    }
                    t[i].id = "tit_" + ++sId;
                    t[i].text = ol.getTitText(t[i]);
                    t[i].isParent = false;

                    // 判断层级
                    if (t[i - 1] && (t[i].level > t[i - 1].level)) {
                        t[i - 1].isParent = true;
                        t[i].parentId = t[i - 1].id;
                    } else {
                        for (var j = 1; j < i; j++) {
                            if (t[i - j].level == t[i].level) {
                                t[i].parentId = t[i - j].parentId;
                                break;
                            }
                        }
                    }
                }

                topLv = ol.getTopLevel(t);
                // 创建目录整体
                wrapStr = "<div id='" + c.outlId + "' class='" + c.outlClass + "'></div>";
                b.innerHTML = wrapStr + b.innerHTML;
                outl = utils._id(c.outlId);
                outl.style.width = c.outlWidth + "px";
                // 创建目录节点
                for (i = 0, len = t.length; i < len; i++) {
                    ol.createOutlNode(t[i].id, t[i].level, t[i].parentId, t[i].text, t[i].isParent, topLv);
                }
            },
            // 创建目录节点
            createOutlNode: function(titId, level, parentId, text, isParent, topLv) {
                var c = conf,
                    titStr,
                    tree, subId,
                    subStr, btnStr,
                    subFoldClass,
                    btnFoldClass;

                tree = document.createElement("li");
                tree.id = c.outlId + "_" + titId;
                // 当前最高层级标题命类名
                tree.className = "level" + level;
                if (level == topLv) {
                    utils._addClass(tree, "top-level");
                }

                // 创建每个标题的内部节点
                titStr = "<a class='" + c.outlClass + "-tit' data-index='" + titId + "'>" + text + "</a>";
                tree.innerHTML += titStr;

                // 如果有子标题
                if (isParent) {
                    // 建立子标题列表ul
                    subId = tree.id + "_ul";
                    subFoldClass = c.ifFold ? "close" : "open";
                    subStr = "<ul id='" + subId + "' class='" + subFoldClass + "'></ul>";
                    tree.innerHTML += subStr;
                    // 创建展开按钮并绑定按钮事件
                    btnFoldClass = c.ifFold ? "close-bar" : "open-bar";
                    btnStr = "<span class='" + c.outlClass + "-btn' data-ctrList='" + subId + "'> <span class = 'bar'></span> <span class = 'bar2 " + btnFoldClass + "'></span></span>";
                    tree.innerHTML = btnStr + tree.innerHTML;
                }

                // 将创建好的当前列表加入目录
                if (parentId) {
                    utils._id(c.outlId + "_" + parentId + "_ul").appendChild(tree);
                } else {
                    utils._id(c.outlId).appendChild(tree);
                }
            },
            //点击展开按钮事件handler
            initBtnEvent: function(btn) {
                var ctrList = btn.getAttribute("data-ctrList"),
                    u = utils._id(ctrList),
                    bar2 = utils._class("bar2", btn)[0];
                if (utils._hasClass(u, "close")) {
                    u.className = "open";
                    bar2.className = "bar2 open-bar";
                } else if (utils._hasClass(u, "open")) {
                    u.className = "close";
                    bar2.className = "bar2 close-bar";
                }
            },
            // 目录标题点击handler
            titClick: function(target) {
                var c = conf,
                    titId = target.getAttribute("data-index"),
                    index = titId.substring(titId.indexOf("_") + 1) - 1;

                utils._removeClass(curTit, "selected");
                curTit = target;
                utils._addClass(curTit, "selected");
                if (!c.ifSmooth) {
                    window.scrollTo(0, titPos[index]);
                } else {
                    ol.scrollControl(titPos[index]);
                }
            },
            // 目录跟踪内容滚动
            followScroll: function(titles) {
                var t = titles,
                    tmpTit,
                    scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

                // 遍历标题找到当前位置内容
                for (var i = 0, len = t.length; i < len; i++) {
                    if (scrollTop > titPos[i] - 30 && scrollTop < titPos[i] + 30) {
                        tmpTit = document.querySelector("[data-index=" + t[i].id + "]");
                    }
                    if (tmpTit) {
                        utils._removeClass(curTit, "selected");
                        curTit = tmpTit;
                        utils._addClass(curTit, "selected");
                        break;
                    }
                }
            },
            // 执行页面滚动
            scroll: function(len) {
              if(document.documentElement.scrollTop){
                document.documentElement.scrollTop = len;
              }else if(document.body.scrollTop){
                document.body.scrollTop = len;
              }
            },
            // 页面滚动控制
            scrollControl: function(pos) {
                var c = conf,
                    dist,
                    top = document.body.scrollTop || document.documentElement.scrollTop,
                    t = 0,
                    sTimeout;

                dist = pos - top;

                run();
                // 每一步滚动
                function run() {
                    var len;
                    len = Math.ceil(ol.scrollTween(t, top, dist, c.duration));

                    ol.scroll(len);
                    if (t < c.duration) {
                        t++;
                        sTimeout = setTimeout(run, 10);
                    } else {
                        clearTimeout(sTimeout);
                        sTimeout = null;
                    }
                }
            },
            // 缓动算法（Cubic）
            scrollTween: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            }
        };

    // 初始化: 封装原有页面内容
    function initArticle() {
        var c = conf,
            wrap,
            b = document.body;

        wrap = document.createElement("div");
        wrap.className = c.wrapClass;
        wrap.style.marginLeft = c.outlWidth + "px";
        //不包裹<link>&<script>
        while (b.firstChild.nodeName != "LINK" && b.firstChild.nodeName != "SCRIPT") {
            wrap.appendChild(b.firstChild);
        }

        if (b.firstChild) {
            b.insertBefore(wrap, b.firstChild);
        } else {
            b.appendChild(wrap);
        }
    }
    //初始化: 生成目录
    function initOutline() {
        var t = ol.getAllTit();
        // 创建目录
        ol.createOutline(t);
        //默认选中第一个title
        curTit = document.querySelector("[data-index='tit_1']");
        utils._addClass(curTit, "selected");
        // 添加滚动事件
        initScrollEvent(t);
    }
    //初始化：展开按钮&目录标题点击事件
    function initClickEvent() {
        var c = conf,
            outl = utils._id(c.outlId),
            btnClass = c.outlClass + "-btn",
            titClass = c.outlClass + "-tit";
        // 展开按钮事件
        utils._delegate("click", outl, btnClass, function() {
            if (this.getAttribute("data-ctrList")) {
                ol.initBtnEvent(this);
            }
        });
        // 标题事件
        utils._delegate("click", outl, titClass, function() {
            if (this.getAttribute("data-index")) {
                ol.titClick(this);
            }
        });
    }
    //初始化: 滚动监听
    function initScrollEvent(titles) {
        utils._addEvent(window, "scroll", function() {
            if (posTimeout) {
                clearTimeout(posTimeout);
                posTimeout = null;
            }
            ol.followScroll(titles);
            posTimeout = setTimeout(refreshPos, 500);
        });
    }
    // 定时更新标题位置
    function refreshPos() {
        var t = ol.getAllTit();
        if (posTimeout) {
            clearTimeout(posTimeout);
            posTimeout = null;
        }
        for (var i = 0, len = t.length; i < len; i++) {
            titPos[i] = ol.getPos(t[i]);
        }
        posTimeout = setTimeout(refreshPos, 500);
    }

    /**
     * 启动
     */
    initArticle();
    initOutline();
    initClickEvent();
    refreshPos();
};
