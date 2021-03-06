var clock;
    $(window).on('scroll', function(){
    //用户鼠标滚轮滚动一次，有多次事件响应。下面的 setTimeout 主要是为性能考虑，只在最后一次事件响应的时候执行 checkshow
      if(clock){
        clearTimeout(clock);
     }
       clock = setTimeout(function(){
        checkShow();
       }, 100);
    });
  // 用户第一次打开页面，还未滚动窗口的时候需要执行一次 checkShow 0
  checkShow();
  function checkShow(){
    if(isShow($('#load'))){  //如果底部出现在可视区域2
      loadAndPlace();     //获取并摆放资源3
    }
  }
  function isShow($el){  //判断可视区域1
    var scrollH = $(window).scrollTop(),
        winH = $(window).height(),
        top = $el.offset().top;
      if(top < winH + scrollH){
        return true;
      }else{
        return false;
      }
  }
// 获取数据，并且？？？摆放位置？？？
var curPage = 1,
    perPageCount = 9;
function loadAndPlace(){
  $.ajax({                     //加载资源3.1
    url: 'https://platform.sina.com.cn/slide/album_tech',
    dataType: 'jsonp',   //这里使用了新浪新闻的 jsonp 接口，大家可以直接看数据， 如： http://platform.sina.com.cn/slide/album_tech?jsoncallback=func&app_key=1271687855&num=3&page=4
    jsonp:"jsoncallback",
    data: {
      app_key: '1271687855',
      num: perPageCount,
      page: curPage
    }
  }).done(function(ret){
    if(ret && ret.status && ret.status.code === "0"){
      place(ret.data);   //如果数据没问题，那么生成节点并摆放好位置
    }else{
      console.log('get error data');
    }
  });
  }
function place(nodeList){  //摆放资源3.2
  console.log(nodeList);
  var $nodes = renderData(nodeList);  //节点生成后添加到页面上
  var defereds = [];  //创建存储 defered 对象的数组

  $nodes.find('img').each(function(){
    var defer = $.Deferred();// 创建Deferred对象？？？？？？？？？？？？？？？？？？？？？？？？
    $(this).load(function(){
      defer.resolve();//如果执行状态是"已完成"（resolved）,deferred对象立刻调用done()方法指定的回调函数
    });   //当每个图片加载完成后，执行 resolve

    defereds.push(defer);
  });
  $.when.apply(null,defereds).done(function() { //当所有的图片都执行 resolve 后，即全部图片加载后，执行下面的内容
    console.log('new images all loaded ...');

    //当节点里的图片全部加载后再使用瀑布流计算，否则会因为图片未加载 item 高度计算错误导致瀑布流高度计算出问题
    waterFallPlace($nodes);
  });
}
// 瀑布流4
var colSumHeight = [],//创建容纳 列 的数组
  nodeWidth = $('.item').outerWidth(true),//获得列宽
  colNum = parseInt($('#pic-ct').width()/nodeWidth);//计算列的数量
for(var i=0; i<colNum; i++){
  colSumHeight.push(0);
}
function waterFallPlace($nodes){
  $nodes.each(function(){
    var $cur = $(this); //colSumHeight = [100, 250, 80, 200]
    var idx = 0,
      minSumHeight = colSumHeight[0];
    for(var i=0;i<colSumHeight.length; i++){
      if(colSumHeight[i] < minSumHeight){
        idx = i;
        minSumHeight = colSumHeight[i];//遍历数组，得到最短列
      }
    }
    $cur.css({
      left: nodeWidth*idx, // 设置position位置
      top: minSumHeight,
      opacity: 1
    });
    colSumHeight[idx] = $cur.outerHeight(true) + colSumHeight[idx];//重新计算最短列的值
    $('#pic-ct').height(Math.max.apply(null,colSumHeight));//找出最长列?????
                                     //重新计算瀑布的高？？？？
  });
}
function renderData(items){ //拼接HTML渲染到页面上
  var tpl = '',
    $nodes;
  for(var i = 0;i<items.length;i++){
    tpl += '<li class="item">';
    tpl += ' <a href="'+ items[i].url +'" class="link"><img src="' + items[i].img_url + '" alt=""></a>';
    tpl += ' <h4 class="header">'+ items[i].short_name +'</h4>';
    tpl += '<p class="desp">'+items[i].short_intro+'</p>';
    tpl += '</li>';
  }
  $nodes = $(tpl);
  $('#pic-ct').append($nodes);
  return $nodes;
}
